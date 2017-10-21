// Configure the package (optional)

Jobs.configure = function (data) {
	Object.keys(data).forEach(function (key) {
		Jobs.private.configuration[key] = data[key];
	});
}

// Register jobs in a similar style to Meteor methods

Jobs.register = function (jobs) {
	Object.keys(jobs).forEach(function (job) {
		if (typeof jobs[job] === "function") {
			Jobs.private.registry[job] = jobs[job];	
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

Jobs.start = function () {
	return JobsRunner.start();
}

Jobs.stop = function () {
	return JobsRunner.stop();
}

// Restart the queue, forcing failed jobs to run without restarting server
// The server that this function runs on will take over running the queue
// Intended for debugging

Jobs.restart = function () {
	JobsRunner.stop();
	JobsControl.setAsActive();
	JobsRunner.state = "failed";
	JobsRunner.start();
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

Jobs.clear = function (failed, pending) {
	return Jobs.private.clear(failed, pending)
}

// Access to MongoDB Collection
Jobs.collection = Jobs.private.collection;