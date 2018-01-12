import { Mongo } from 'meteor/mongo'
import { Random } from 'meteor/random'
import { Utilities } from '../../utilities/'

var dominator = {
	collection: new Mongo.Collection("jobs_dominator"),
	serverId: function () {
		return Random.id();
	}(),
	isActive: function () {
		var self = this;

		if (Meteor.isDevelopment) {
			return self.setAsActive();
		}

		var doc = self.collection.findOne({}, {
			sort: {
				lastPing: 1,
			}
		});

		if (!doc || doc.serverId === self.serverId) {
			return self.setAsActive();
		} else {
			var timeGap = new Date () - doc.lastPing;
			var timeSpacer = Utilities.config.maxWait;

			if (timeGap >= timeSpacer) {
				return self.setAsActive()
			}
		}
	},
	setAsActive: function () {
		var self = this;

		var result = self.collection.upsert({
			serverId: self.serverId
		}, {
			$set: {
				lastPing: new Date(),		
			},
			$setOnInsert: {
				created: new Date()
			}
		})

		return result;
	},
	reset: function () {
		self = this;
		self.serverId = Random.id();
	}
}

export { dominator }