// Need a way to ensure that only one server is processing jobs
// The idea is that if a server is active, it'll mark its presence in MongoDB
// If it doesn't do that for X minutes, another server will take over

// Idea: if CPU usage is high, let go of server, or pause jobs, until things settle (?)

JobsControl = {
	collection: new Mongo.Collection('jobsSettings'),
	serverId: Math.random(), 
	isActive: function () {
		var self = this;

		doc = self.collection.find({name: "ActiveServer"}).fetch();

		if (!doc) {
			return self.setAsActive();
		}
		else if (doc.serverId === self.serverId) {
			return self.setAsActive();
		} 
		else {
			var timeGap = new Date () - doc.lastPing;
			var timeSpacer = Jobs.private.configuration.checker || 10*60*1000 // 10 minutes

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
	}
}