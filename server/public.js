// Register jobs

Jobs.register = function (jobs) {
	Object.keys(jobs).forEach(function (job) {
		if (typeof jobs[job] === "function") {
			Jobs.internal.registry[job] = jobs[job];	
		} else {
			console.log("Jobs: Error registering " + job);
			console.log("Jobs: Please make sure its a valid function");
			console.log("----");
		}
	});
}

// Add a new job to MongoDB

Jobs.add = function (job) {
	// Should probably implement some kind of argument checking here
	
	date = job.on || job.at;
	date = magic(date);

	return SteveJobsData.insert({
		due: date,
		name: job.name,
		parameters: job.parameters
	});
}

// Remove a job from MongoDB

Jobs.remove = function () {
	return Jobs.internal.collection.remove(id)
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
	return Jobs.internal.collection.findOne(id)
}

// Run a job ahead of time

Jobs.run = function (doc) {
	if (typeof doc === "object") {
		Jobs.internal.run(doc)
	} else if (typeof doc === "string") {
		jobDoc = Jobs.internal.collection.findOne(doc);

		if (jobDoc) {
			Jobs.internal.run(jobDoc)
		}
	} else {
		console.log("Jobs: Invalid input for Jobs.run();")
		console.log(doc)
		console.log('----')
	}
	// ...
}