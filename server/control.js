// Need a way to ensure that only one server is processing jobs
// The idea is that if a server is active, it'll mark its presence in MongoDB
// If it doesn't do that for X minutes, another server will take over

// Idea: if CPU usage is high, let go of server, or pause jobs, until things settle (?)

JobsControl = {
	collection: new Mongo.Collection('jobsSettings'),
	serverId: Math.random(), 
	checkIfActiveServer: function () {
		self = this;
		doc = self.collection.find({name: "ActiveServer"})

		if (!doc) {
			self.setAsActiveServer();
		}
		else if (doc.serverId === self.serverId) {
			self.setAsActiveServer();
		} 
		else {
			timeGap = new Date () - doc.lastPing;
			timeSpacer = Jobs.timeGap || 10*60*1000 // 10 minutes
			if (timeGap > timeSpacer) {
				self.setAsActiveServer()
			}
		}
	},
	setAsActiveServer: function () {
		self = this;

		return self.collection.upsert({name: "ActiveServer"}, $set: {
			lastPing: new Date(),
			serverId: self.serverId
		})
	}
}