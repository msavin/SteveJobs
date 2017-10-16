// Future idea: When it runs the last job, the package could check if there is something scheduled to run before its time out, and shorten the timeout
// Future idea: Provide ability to run jobs across multiple servers. Perhaps it could be divided by considering if the MongoDB document id starts with a number or letter.

JobsRunner = {
	available: true,
	state: null,
	ranFailed: false,
	start: function () {
		var self = this;

		self.state = Meteor.setInterval(function () {
			self.run()
		}, Jobs.private.configuration.timer);
	},
	stop: function () {
		var self = this;
		return Meteor.clearInterval(self.state);
	},
	run: function () {
		var self = this;

		if (JobsControl.isActive) {
			if (self.available) {
				self.available = false;
				self.runLatest();
			}
		}
	},
	runLatest: function () {
		var self = this;
		var state = "pending"

		if (!self.ranFailed) {
			var state = "failed"
		}

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

		if (jobDoc) {
			Jobs.run(jobDoc, function () {
				self.available = true;
				JobsRunner.runLatest()
			});
		} else {
			self.available = true;

			if (!self.ranFailed) {
				self.ranFailed = true;
				JobsRunner.runLatest();
			}
		}
	}
}

Meteor.startup(function () {
	var delay = Jobs.private.configuration.startupDelay;

	Meteor.setTimeout(function () {
		JobsRunner.start();
	}, delay)
});