import { Mongo } from "meteor/mongo"
import { Utilities } from "../../utilities/"

/* 
	Potential Optimization
		if a server is marked as active,
		dominator should return `true` for `isActive`
		without running the query for ~1 minute

	Non-problematic bug
		- When the queue starts, if there is more than one queue running,
		they will all call dominator.isActive at the same time
		- The problem with this, is that because the functions are milliseconds apart,
		MongoDB will try to run all the upserts in `setAsActive` at once
		- As a result, the "jobs_dominator_3" collection has a unique index on serverId
		- Sometimes, MongoDB might throw an error because an insert was attempted
		over a non-unique index - however, this is harmless
		- To prevent annoying console messages, `dominator.setAsActive` has been wrapped in try/catch

*/

var dominator = {
	collection: new Mongo.Collection("jobs_dominator_3"),
	serverId: null,
	isActive: function () {
		var self = this;

		// set serverId if one is not set
		if (!self.serverId) {
			self.serverId = Utilities.config.getServerId();
		}

		// since Meteor runs only one server in development,
		// we should set dominator as active immediately, otherwise 
		// it would wait the `lastPing` to surpass `maxWait` 
		if (Meteor.isDevelopment && !Utilities.config.disableDevelopmentMode) {
			return self.setAsActive();
		}
		
		// then business as usual
		var doc = self.collection.findOne({}, {
			sort: {
				lastPing: -1,
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
		var lastPing = new Date();

		try { 
			var result = self.collection.upsert({
				serverId: self.serverId
			}, {
				$set: {
					lastPing: lastPing,		
				},
				$setOnInsert: {
					created: lastPing
				}
			})

			if (result) {
				self.lastPing = lastPing;
			}
			
			return result;
		} catch (e) {
			// https://www.youtube.com/watch?v=SHs6O6jC7Y8
		}
		
	},
	reset: function () {
		self = this;
		self.serverId = Utilities.config.getServerId(true)
	}
}

dominator.collection._ensureIndex({serverId: 1}, {unique: 1});

export { dominator }