import { Meteor } from 'meteor/meteor';
import { Utilities } from '../../utilities/'
import { execute } from '../../actions/execute';
import { dominator } from '../dominator';

/*
	This object ensures that only job is processed at a time (and on one server)
	It starts a new runner for each queue that you register
	Queues can be accessed with Jobs.queue

	How it works
	1. when a server starts up, it will run the start function after a slight delay
	2. When the start function runs, it'll start an interval timer for every X seconds (5 is default)
	3. When the interval timer runs, it will check that the server is active via `control.js`
	4. If the server is active, it will look for jobs to run

	How jobs are ran
	1. first, the queue will check if there are failed jobs. if there are, it will try to run them again
	2. after the failed jobs are processed, it will check for new jobs and run them
	3. jobs are based on whichever comes first (and ultimately, whatever MongoDB returns to us)

	When a job is running, JobsRunner will ignore the setInterval calls. 
	When a job completes, Jobs will check if there are more jobs to run.
	If there are more jobs to run, Jobs will continue to run them consecutively. 
	If there are no more jobs to run, Jobs will go back to polling with setInterval

	Protecting against stale reads
	Sometimes, it takes a bit of time for writes to be reflected in the reads
	To protect against a job running twice, the queue will keep track of which doc it ran last,
	and ensure that it does not come up in the following query



*/

var queue = function (name) {
	this.name = name;
	this.state = "failure";
	this.interval = null;
	this.available = true;
	this.previouslyRan = undefined;
}

queue.prototype.start = function () {
	var self = this;
	
	if (self.interval) {
		Utilities.logger('Cannot start queue because it has already been started: ' + self.name);
		return;
	}

	var action = self.trigger.bind(self);
	self.interval = Meteor.setInterval(action, Utilities.config.interval);
}

queue.prototype.stop = function () {
	var self = this;

	if (!self.interval) {
		Utilities.logger('Cannot stop queue because it has already been stopped: ' + self.name);
		return;
	}

	self.state = "failure";
	self.previouslyRan = undefined;
	self.interval = Meteor.clearInterval(self.interval);
}

queue.prototype.trigger = function () {
	var self = this;

	if (self.available === true) {
		self.available = false;

		if (dominator.isActive()) {
			self.run()
		} else {
			self.available = true;
		}
	}
}

queue.prototype.grabDoc = function () {
	var self = this;
	var state = self.state;
	var name = self.name;
	var previouslyRan = self.previouslyRan;

	var jobDoc = Utilities.collection.findOne({
		_id: {
			$ne: previouslyRan
		},
		name: name,
		due: {
			$lt: new Date()
		},
		state: state,
		history: {
			$not: {
				$elemMatch: {
					state: "failure",
					server: dominator.serverId
				}
			}
		}
	}, {
		sort: {
			due: 1,
			priority: 1
		}
	});

	this.previouslyRan = jobDoc._id;

	return jobDoc;
}

queue.prototype.run = function () {
	var self = this;
	var jobDoc = self.grabDoc();

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