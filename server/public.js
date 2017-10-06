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
}

// Remove a job from MongoDB

Jobs.remove = function () { /* ... */ }

// Start or stop the queue
// Could be handy for debugging or with meteor-shell

Jobs.start = function () {
	JobsRunner.start();
}
Jobs.stop = function () {
	JobsRunner.stop();
}

// Get info on a job/jobs

Jobs.get = function () {
	// ...
}

// Run a job ahead of time

Jobs.run = function () {
	// ...
}