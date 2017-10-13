// Goal 1: Ensure this only runs on one server
// Goal 2: Provide a way to set the timeout
// Future: When it runs the last job, the package could check if there is something scheduled to run before its time out, and shorten the timeout
// Future: Provide ability to run jobs across multiple servers. Perhaps it could be divided by considering if the MongoDB document id starts with a number or letter.

JobsRunner = {
	available: true,
	state: null,
	start: function () {
		var self = this;

		this.state = Meteor.setTimeout(function () {
			self.run()
		}, Jobs.private.configuration.timer);
	},
	stop: function () {
		return Meteor.clearTimeout(this.state);
	},
	run: function () {
		var self = this;

		if (JobsControl.checkIfActiveServer) {
			if (self.available) {
				self.available = false;
				JobsRunner.runLatest()
			}
		}
	},
	runLatest: function () {
		var self = this;

		var latestJob = Jobs.private.collection.findOne({
			due: {
				$lt: new Date()
			}
		}, {
			sort: {
				due: -1, 
				limit: 1
			}
		});

		if (latestJob) {
			job = Jobs.private.run(latestJob, function () {
				self.available = true;
				JobsRunner.runLatest()
			});
		}
	}
}

Meteor.startup(function () {
	JobsRunner.start();
});

