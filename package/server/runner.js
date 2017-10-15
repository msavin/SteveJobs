// Goal 1: Ensure this only runs on one server
// Goal 2: Provide a way to set the timeout
// Future: When it runs the last job, the package could check if there is something scheduled to run before its time out, and shorten the timeout
// Future: Provide ability to run jobs across multiple servers. Perhaps it could be divided by considering if the MongoDB document id starts with a number or letter.

JobsRunner = {
	available: true,
	state: null,
	start: function () {
		var self = this;

		self.state = Meteor.setTimeout(function () {
			self.run()
		}, Jobs.private.configuration.timer);
	},
	stop: function () {
		var self = this;
		return Meteor.clearTimeout(self.state);
	},
	run: function () {
		var self = this;

		if (JobsControl.isActive) {
			if (self.available) {
				self.available = false;
				self.runLatest();
			}
		} else {
			self.stop();
		}
	},
	runLatest: function () {
		var self = this;

		var latestJob = Jobs.private.collection.findOne({
			due: {
				$lt: new Date()
			},
			state: "pending"
		}, {
			sort: {
				due: -1
			}
		});

		if (latestJob) {
			Jobs.run(latestJob, function () {
				self.available = true;
				JobsRunner.runLatest()
			});
		}
	}
}

Meteor.startup(function () {
	JobsRunner.start();
});

/*
	Potential (small) Bug: 
		- person manually runs job with Jobs.run()
		- jobs queue runs the same job 
		- run function should be integrated with `JobsRunner.available` or ...
*/