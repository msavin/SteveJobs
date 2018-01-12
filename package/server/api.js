import { Actions } from './imports/actions'
import { Utilities } from './imports/utilities'
import { Operator } from './imports/operator'

Jobs = {}

// Configure the package (optional)

Jobs.configure = function (config) {
	check(config, {
		autoStart: Match.Maybe(Boolean),
		interval: Match.Maybe(Number),
		startupDelay: Match.Maybe(Number),
		maxWait: Match.Maybe(Number)
	})

	Object.keys(config).forEach(function (key) {
		Utilities.config[key] = config[key];
	});
}

// Register jobs in a similar style to Meteor methods

Jobs.register = function (jobs) {
	check(jobs, Object);

	Object.keys(jobs).forEach(function (job) {
		if (typeof jobs[job] === "function") {
			// Register the job and start the queue
			Operator.manager.add(job);
			Utilities.registry.add(job, jobs[job]);

			// If Jobs has already started, start the queue automatically
			if (Utilities.config.started) {
				Operator.manager.queues[job].start();
			}
		} else {
			Utilities.logger("Register failed - this key should be a function: " + job);
		}	
	})
}

// Adds a new job to MongoDB

Jobs.run = function () {
	check(arguments[0], String)

	if (Utilities.registry.data[arguments[0]]) {
		return Actions.add.apply(null, arguments);
	} else {
		Utilities.logger("invalid job name: " + arguments[0] || "not specified");
		return false;
	}
}

// Cancel a job without removing it from MongoDB

Jobs.cancel = function (jobId) {
	check(jobId, String);
	return Actions.cancel(jobId);
}

// Start or stop the queue - intended for debugging and/or single server deployments

Jobs.start = function (name) {
	check(name, Match.OneOf(undefined, String, [String]))
	Operator.manager.start(name);
}

Jobs.stop = function (name) {
	check(name, Match.OneOf(undefined, String, [String]))
	Operator.manager.stop(name);
}

// Get info on a job

Jobs.get = function (jobId) {
	check(jobId, String);
	return Actions.get(jobId);
}

// Run a job ahead of time

Jobs.execute = function (jobId, callback, force) {
	check(jobId, String)
	check(force, Match.Optional(Boolean))

	// 1. Get the job
	var doc = Utilities.collection.findOne({ 
		_id: jobId,
		state: {
			$nin: ["success", "cancelled"]
		}
	});

	// 1a. Ensure the job is legit
	if (!doc) {
		Utilities.logger("Unable to execute job. Job is completed or cannot be found.");
		return false;
	}

	// 2. Figure out the execution plan
	if (typeof callback !== "undefined") {
		if (typeof callback === "function") {
			// business as usual
		} else if (typeof callback === "boolean") {
			force = true;
			callback = undefined;
		} else {
			Utilities.logger("Execute call abandoned for " + jobId + " because of invalid callback");
			return false;
		}
	}

	// 3. Ensure the job is real

	if (Operator.manager.isAvailable(doc.name) || force) {
		return Actions.execute(doc, callback, force)
	} else {
		Utilities.logger("Unable to execute job -  queue is busy: " + doc.name + "/" + jobId);
		return false;
	}
}

// Reschedule a job

Jobs.reschedule = function (jobId, config) {
	check(jobId, String)
	check(config, {
		date: Match.Maybe(Object),
		in: Match.Maybe(Object),
		on: Match.Maybe(Object),
		priority: Match.Maybe(Number),
	})

	return Actions.reschedule(jobId, config);
}

// Clear resolved jobs - or all of them 

Jobs.clear = function (state, name) {
	check(state, Match.OneOf(undefined, String, [String]))
	check(name, Match.Optional(String))

	return Actions.clear(state, name);
}

// Internals for debugging

var JobsInternal = {}
JobsInternal.Actions = Actions;
JobsInternal.Utilities = Utilities;
JobsInternal.Operator = Operator;

export { Jobs, JobsInternal }