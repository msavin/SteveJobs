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

*/

JobsRunners = function () {
	this.interval = null;
	this.state =  "failed";
	this.available = true;


	this.start = function () {
		var self = this;

		self.interval = Meteor.setInterval(function () {
			self.trigger();
		}, Jobs.private.configuration.timer);
	}

	this.stop = function () {
		var self = this;
		return Meteor.clearInterval(self.interval);
	}

	this.trigger = function () {
		var self = this;

		if (JobsRunner.available === true) {
			JobsRunner.available = false;

			if (JobsControl.isActive) {
				self.run();
			} else {
				JobsRunner.available = true;
			}
		}
	}

	this.grabDoc = function () {
		var self = this;
		var state = self.state;

		var jobDoc = Jobs.private.collection.findOne({
			due: {
				$lt: new Date()
			},
			state: state,
			lastServer: {
				$ne: JobsControl.serverId
			}
		}, {
			sort: {
				due: 1,
				priority: 1
			}
		});

		return jobDoc;
	}

	this.run = function () {
		var self = this;
		var state = self.state;
		var jobDoc = self.grabDoc();
		
		if (jobDoc) {
			Jobs.private.start(jobDoc, function () {
				JobsRunner.available = true;
				self.trigger()
			});
		} else {
			JobsRunner.available = true;
			if (self.state === "failed") {
				self.state = "pending";
				self.trigger();
			}
		}
	}
	
}

// Converted it to a prototype
// The plan is to start a new runner for each job
// The runner should start upon initialization
JobsRunner = new JobsRunners();