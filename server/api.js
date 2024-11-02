import { check, Match } from 'meteor/check'
import { Actions } from './imports/actions'
import { Utilities } from './imports/utilities'
import { Operator } from './imports/operator'
import './imports/startup'

const Jobs = {}

// Validated Jobs.run configuration schema

const JobRunConfigSchema = {
	in: Match.Maybe({
		millisecond: Match.Maybe(Number),
		milliseconds: Match.Maybe(Number),
		second: Match.Maybe(Number),
		seconds: Match.Maybe(Number),
		minute: Match.Maybe(Number),
		minutes: Match.Maybe(Number),
		hour: Match.Maybe(Number),
		hours: Match.Maybe(Number),
		day: Match.Maybe(Number),
		days: Match.Maybe(Number),
		month: Match.Maybe(Number),
		months: Match.Maybe(Number),
		year: Match.Maybe(Number),
		years: Match.Maybe(Number),
	}),
	on: Match.Maybe({
		millisecond: Match.Maybe(Number),
		milliseconds: Match.Maybe(Number),
		second: Match.Maybe(Number),
		seconds: Match.Maybe(Number),
		minute: Match.Maybe(Number),
		minutes: Match.Maybe(Number),
		hour: Match.Maybe(Number),
		hours: Match.Maybe(Number),
		day: Match.Maybe(Number),
		days: Match.Maybe(Number),
		month: Match.Maybe(Number),
		months: Match.Maybe(Number),
		year: Match.Maybe(Number),
		years: Match.Maybe(Number),
	}),
	date: Match.Maybe(Date),
	priority: Match.Maybe(Number),
	unique: Match.Maybe(Boolean),
	singular: Match.Maybe(Boolean),
	callback: Match.Maybe(Function),
	data: Match.Maybe(Object),
};

// Configure the package (optional)

Jobs.configure = function (config) {
	check(config, {
		autoStart: Match.Maybe(Boolean),
		autoPurge: Match.Maybe(Boolean),
		autoRetry: Match.Maybe(Boolean),
		interval: Match.Maybe(Number),
		startupDelay: Match.Maybe(Number),
		maxWait: Match.Maybe(Number),
		disableDevelopmentMode: Match.Maybe(Boolean),
		setServerId: Match.Maybe(Function),
		getDate: Match.Maybe(Function),
		log: Match.Maybe(Function),
		remoteCollection: Match.Maybe(String),
		gracePeriod: Match.Maybe(Number),
		collectionName: Match.Maybe(String)
	})

	Object.keys(config).forEach(function (key) {
		Utilities.config[key] = config[key];
	});
}

// Register jobs in a similar style to Meteor methods

Jobs.register = async function (jobs) {
	check(jobs, Object);

	for (const job of Object.keys(jobs)) {
		if (typeof jobs[job] === "function") {
			// Register the job and start the queue
			Operator.manager.add(job);
			Utilities.registry.add(job, jobs[job]);

			// If Jobs has already started, start the queue automatically
			if (Utilities.config.started) {
				await Operator.manager.queues[job].start();
			}
		} else {
			Utilities.logger("Register failed - this key should be a function: " + job);
		}
	}
}
// Adds a new job to MongoDB

Jobs.run = async function () {
	check(arguments[0], String)

	const lastArg = arguments[arguments.length - 1];
	const config = (typeof lastArg === "object" && !Array.isArray(lastArg) && !lastArg.remote) ? lastArg : {};

	check(config, Match.Optional(JobRunConfigSchema));

	const remote = typeof lastArg === "object" && lastArg.remote;

	if (Utilities.registry.data[arguments[0]] || remote) {
		return await Actions.add.apply(null, arguments);
	} else {
		Utilities.logger("invalid job name: " + arguments[0] || "not specified");
		return false;
	}
}

// Update / manage a job even though it has not run

Jobs.find = async function () {
	check(arguments[0], String)

	if (Utilities.registry.data[arguments[0]]) {
		return await Actions.find.apply(null, arguments);
	} else {
		Utilities.logger("invalid job name: " + arguments[0] || "not specified");
		return false;
	}
}

// Cancel a job without removing it from MongoDB

Jobs.cancel = async function (jobId) {
	check(jobId, String);
	return await Actions.cancel(jobId);
}

// Start or stop the queue - intended for debugging and/or single server deployments

Jobs.start = async function (name) {
	check(name, Match.OneOf(undefined, String, [String]))
	return await Operator.manager.start(name);
}

Jobs.stop = async function (name) {
	check(name, Match.OneOf(undefined, String, [String]))
	return await Operator.manager.stop(name);
}

// Get info on a job

Jobs.get = async function (jobId) {
	check(jobId, String);
	return await Actions.get(jobId);
}

// Run a job ahead of time

Jobs.execute = async function (jobId, callback, force) {
	check(jobId, String)
	check(force, Match.Optional(Boolean))

	// 1. Get the job
	const doc = await Utilities.collection.findOneAsync({
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
		return await Actions.execute(doc, callback, force)
	} else {
		Utilities.logger("Unable to execute job -  queue is busy: " + doc.name + "/" + jobId);
		return false;
	}
}

// Reschedule a job

Jobs.reschedule = async function (jobId, config) {
	check(jobId, String)
	if (config) check(config, {
		date: Match.Maybe(Date),
		in: Match.Maybe(Object),
		on: Match.Maybe(Object),
		priority: Match.Maybe(Number),
		callback: Match.Maybe(Function)
	})

	return await Actions.reschedule(jobId, config);
}

// Replicate a job to run it again later

Jobs.replicate = async function (jobId, config) {
	check(jobId, String)
	if (config) check(config, {
		date: Match.Maybe(Date),
		in: Match.Maybe(Object),
		on: Match.Maybe(Object),
		data: Match.Maybe(Object),
		priority: Match.Maybe(Number),
	})

	return await Actions.replicate(jobId, config);
}

// Clear resolved jobs - or all of them

Jobs.clear = async function (state, name, callback) {
	check(state, Match.OneOf(undefined, String, [String]))
	check(name, Match.Optional(String))
	check(callback, Match.Optional(Function))

	return await Actions.clear(state, name, callback);
}

// Remove the job

Jobs.remove = async function (jobId, callback) {
	check(jobId, String)
	check(callback, Match.Maybe(Function))

	return await Actions.remove(jobId, callback);
}

// Expose the MongoDB collection

Meteor.startup(function () {
	Jobs.collection = Utilities.collection
})

// Internals for debugging

const JobsInternal = {
	Actions: Actions,
	Utilities: Utilities,
	Operator: Operator
};

export { Jobs, JobsInternal }
