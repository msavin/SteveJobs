// Configure the package

Jobs.configure = function (data) {
	Object.keys(data).forEach(function (key) {
		Jobs.private.configuration[key] = data[key];
	});
}

// Register jobs

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

Jobs.add = function (job) {
	// Check that we have the right input
		if (typeof job === "object") {
			if (typeof job.name !== "string") {
				console.log("Jobs: must specify name")
			}
		} else {
			console.log("Jobs: Invalid input");
			console.log(job)
			console.log("----");
			return;
		}

	// Check that the job being added exists
		if (!Jobs.private.registry[name]) {
			console.log("Jobs: Invalid job name: " + job.name);
		}

	var date = function () {
		// if (jobs.in) {

		// } else if (job.on) {

		// }

		return new Date();
	}();

	return SteveJobsData.insert({
		due: date,
		name: job.name,
		state: "pending",
		parameters: job.parameters
	});
}

// Remove a job from MongoDB

Jobs.remove = function () {
	return Jobs.private.collection.remove(id)
}

// Start or stop the queue
// Could be handy for debugging or with meteor-shell

Jobs.start = function () {
	JobsRunner.start();
}

Jobs.stop = function () {
	JobsRunner.stop();
}

// Get info on a job/jobs

Jobs.get = function (id) {
	return Jobs.private.collection.findOne(id)
}

// Run a job ahead of time

Jobs.run = function (doc, callback) {
	if (typeof doc === "object") {
		Jobs.private.run(doc, callback)
	} else if (typeof doc === "string") {
		jobDoc = Jobs.private.collection.findOne(doc);

		if (jobDoc) {
			Jobs.private.run(jobDoc, callback)
		}
	} else {
		console.log("Jobs: Invalid input for Jobs.run();")
		console.log(doc)
		console.log('----')
	}
}

Jobs.collection = Jobs.private.collection