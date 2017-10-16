// This ensures that only one server is processing jobs
// The idea is that if a server is active, it'll mark its presence in MongoDB
// If it doesn't do that for X minutes, another server will take over

JobsControl = {
	collection: new Mongo.Collection('jobsSettings'),
	serverId: Math.random(), 
	isActive: function () {
		if (Meteor.isDevelopment) {
			return true;
		}

		var self = this;

		doc = self.collection.find({name: "ActiveServer"}).fetch();

		if (!doc) {
			return self.setAsActive();
		} else if (doc.serverId === self.serverId) {
			return self.setAsActive();
		} else {
			var timeGap = new Date () - doc.lastPing;
			var timeSpacer = Jobs.private.configuration.activityDelay || 10*60*1000 // 10 minutes

			if (timeGap > timeSpacer) {
				return self.setAsActive()
			}
		}
	},
	setAsActive: function () {
		var self = this;

		var result = self.collection.upsert({name: "ActiveServer"}, {
			$set: {
				lastPing: new Date(),
				serverId: self.serverId
			}
		})

		return result;
	},
	reset: function () {
		var self = this;
		self.serverId = Math.random();
	}
}