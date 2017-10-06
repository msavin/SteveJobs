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

		if (doc.serverId === self.serverId) {
			if (doc.lastPing ... more than X minutes ago) {
				return true;
			} else {
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