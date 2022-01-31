import { Meteor } from "meteor/meteor"
import { Utilities } from "../../utilities/"
import { execute } from "../../actions/execute"
import { dominator } from "../dominator"

let debugMode = false;

const queue = function (name, state = "failure") {
	this.name = name;
	this.state = "failure";
	this.interval = null;
	this.available = true;
	this.previouslyRan = "this needs to be defined for the Mongo query :P";
}

queue.prototype.start = function () {
	if (debugMode) console.log(`queue.prototype.start(${this.name})`)

	const self = this;
	
	if (self.interval) {
		Utilities.logger(`Cannot start queue because it has already been started: ${self.name}`);
		return;
	}

	const action = self.trigger.bind(self);
	self.interval = Meteor.setInterval(action, Utilities.config.interval);
}

queue.prototype.stop = function () {
	if (debugMode) console.log(`queue.prototype.stop(${this.name})`)

	const self = this;
	const state = Utilities.autoRetry ? "failure" : "pending";

	if (!self.interval) {
		Utilities.logger("Cannot stop queue because it has already been stopped: " + self.name);
		return;
	}

	self.state = state;
	self.previouslyRan = "hi again, I know, this is weird";
	self.interval = Meteor.clearInterval(self.interval);
}

queue.prototype.trigger = function () {
	if (debugMode) console.log(`queue.prototype.trigger(${this.name})`)

	const self = this;

	if (self.available === true && self.interval) {
		try {
			self.available = false;

			if (dominator.isActive()) {
				self.run()
			} else {
				self.available = true;
			}
		} catch(e) {
			console.error(e);
			self.available = true;
		} 
	}
}

queue.prototype.grabDoc = function () {
	if (debugMode) console.log(`queue.prototype.grabDoc(${this.name})`)

	const self = this;

	const jobDoc = Utilities.collection.findOne({
		_id: {
			$ne: self.previouslyRan
		},
		name: self.name,
		due: {
			$lt: Utilities.config.getDate()
		},
		state: self.state,
		history: {
			$not: {
				$elemMatch: {
					state: "failure",
					serverId: Utilities.config.getServerId()
				}
			}
		}
	}, {
		sort: {
			due: 1,
			priority: 1
		}
	});

	if (jobDoc) {
		self.previouslyRan = jobDoc._id;
	} else {
		self.previouslyRan = "not null!"
	}

	return jobDoc;
}

queue.prototype.run = function () {
	if (debugMode) console.log(`queue.prototype.run(${this.name})`)

	const self = this;
	const jobDoc = self.grabDoc();

	if (jobDoc) {
		execute(jobDoc, function () {
			self.available = true;
			self.trigger()
		});
	} else {
		self.available = true;

		if (self.state === "failure") {
			self.state = "pending";
			self.trigger();
		}
	}
}

export { queue }