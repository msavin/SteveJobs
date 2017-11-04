/*
	This object ensures that only job is processed at a time (and on one server)
	It starts a new runner for each queue that you register
	Queues can be accessed with Jobs.queue

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

JobsRunner = function (name) {
	this.name = name;
	this.interval = null;
	this.state =  "failed";
	this.available = true;


	this.start = function () {
		var self = this;

		self.interval = Meteor.setInterval(function () {
			// console.log(name)
			self.trigger();
		}, Jobs.private.configuration.timer);
	}

	this.stop = function () {
		var self = this;
		self.state = "failed";
		return Meteor.clearInterval(self.interval);
	}

	this.trigger = function () {
		var self = this;

		if (self.available === true) {
			self.available = false;

			if (JobsControl.isActive) {
				self.run();
			} else {
				self.available = true;
			}
		}
	}

	this.grabDoc = function () {
		var self = this;
		var state = self.state;
		var name = self.name;

		var jobDoc = Jobs.private.collection.findOne({
			name: name,
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
				self.available = true;
				self.trigger()
			});
		} else {
			self.available = true;
			if (self.state === "failed") {
				self.state = "pending";
				self.trigger();
			}
		}
	}
}