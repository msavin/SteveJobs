Jobs = {
	register: function (jobs) {
		Object.keys(jobs).forEach(function (job) {
			if (typeof jobs[job] === "function") {
				Jobs.internal.registry[job] = jobs[job];	
			} else {
				console.log("Jobs: Error registering " + job);
				console.log("Jobs: Please make sure its a valid function");
				console.log("----");
			}
		});
	},
	add: function (job) {
		// Should probably implement some kind of argument checking here
		
		date = job.on || job.at;
		date = magic(date);

		return SteveJobsData.insert({
			due: date,
			name: job.name,
			parameters: job.parameters
		});
	}
};