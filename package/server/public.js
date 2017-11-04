// Configure the package (optional)

Jobs.configure = function (data) {
	Object.keys(data).forEach(function (key) {
		Jobs.private.configuration[key] = data[key];
	});
}

// Register jobs in a similar style to Meteor methods

Jobs.queues = {}

Jobs.register = function (jobs) {
	Object.keys(jobs).forEach(function (job) {
		if (typeof jobs[job] === "function") {
			Jobs.private.registry[job] = jobs[job];
			
			Meteor.setTimeout(function () {
				Jobs.queues[job] = new JobsRunner(job);
			}, 3000);
		} else {
			console.log("Jobs: Error registering " + job);
			console.log("Jobs: Please make sure its a valid function");
			console.log("----");
		}
	});
}

// Add a new job to MongoDB

Jobs.add = function () {
	return Jobs.private.add.apply(null, arguments)
}

// Cancel a job without removing it from MongoDB

Jobs.cancel = function (id) {
	return Jobs.private.cancel(id);
}

// Start or stop the queue - intended for debugging

Jobs.start = function (queueName) {
	if (queueName) {
		Jobs.queues[queueName].start()
	} else {
		Object.keys(Jobs.queues).forEach(function (queueName) {
			Jobs.queues[queueName].start()
		});
	}
}

Jobs.stop = function (queueName) {
	if (queueName) {
		Jobs.queues[queueName].stop()
	} else {
		Object.keys(Jobs.queues).forEach(function (queueName) {
			Jobs.queues[queueName].stop()
		});
	}
}

// Get info on a job

Jobs.get = function (id) {
	return Jobs.private.collection.findOne(id);
}

// Run a job ahead of time

Jobs.run = function (doc, callback, force) {
	if (force || JobsRunner.available) {
		return Jobs.private.start(doc, callback);
	} else {
		console.log("Jobs: Could not run job because job queue is active");
	}
}

// Clear resolved jobs - or all of them 
// TO DO (?): if the queue is no longer registered, remove all of its documents

Jobs.clear = function (failed, pending) {
	return Jobs.private.clear(failed, pending)
}

// Access to MongoDB Collection
Jobs.collection = Jobs.private.collection;