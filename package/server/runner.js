/*
	
	This object ensures that only job is processed at a time (and on one server)

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
	
	BUG: infinite loop for failed jobs, could be negated by attaching server id to MongoDB document

*/

JobsRunner = {
	timer: null,
	state: "failed",
	available: true,
	start: function () {
		var self = this;

		self.timer = Meteor.setInterval(function () {
			if (JobsControl.isActive) {
				if (self.available) {
					self.available = false;
					self.run();
				}
			}
		}, Jobs.private.configuration.timer);
	},
	stop: function () {
		var self = this;
		return Meteor.clearInterval(self.timer);
	},
	grabDoc: function () {
		var self = this;
		var state = self.state;
		var jobDoc = Jobs.private.collection.findOne({
			due: {
				$lt: new Date()
			},
			state: state
		}, {
			sort: {
				due: -1
			}
		});

		return jobDoc;
	},
	run: function () {
		var self = this;
		var state = self.state;
		var jobDoc = self.grabDoc();

		if (jobDoc) {
			Jobs.run(jobDoc, function () {
				self.available = true;
				self.run()
			});
		} else {
			self.available = true;

			if (state === "failed") {
				self.state = "pending";
				self.run();
			}
		}
	}
}