import { Mongo } from "meteor/mongo"
import { Utilities } from "../../utilities/"

/* 
	Potential Optimization
		if a server is marked as active,
		dominator should return `true` for `isActive`
		without running the query for ~1 minute

	Non-problematic bug
		- When the queue starts, if there is more than one queue running,
		they will all call dominator.isActive at near same time
		- The problem with this, is that because the functions are milliseconds apart,
		MongoDB will try to run all the upserts in `setAsActive` at once
		- As a result, the "jobs_dominator_3" collection has a unique index on serverId
		- Sometimes, MongoDB might throw an error because an insert was attempted
		over a non-unique index - however, this is harmless
		- To prevent annoying console messages, `dominator.setAsActive` has been wrapped in try/catch
*/

var dominator = {
	serverId: null,
	collection: undefined,
	initialized: false
}

dominator.initialize = function () {
	self = this;

	// ensure that we're not doing it twice
	if (self.initialized) {
		return;
	}

	// First, initialize the collection
	if (Utilities.config.remoteCollection) {
		var db = new MongoInternals.RemoteCollectionDriver(Utilities.config.remoteCollection);
		self.collection = new Mongo.Collection("jobs_dominator_3", { _driver: db });
	} else {
		self.collection = new Mongo.Collection("jobs_dominator_3");
	}

	// Then, ensure the index is set
	var index = self.collection._ensureIndex({serverId: 1}, {unique: 1});

	// Finally, set the serverId
	self.serverId = Utilities.config.getServerId();
}
		
dominator.getActive = function () {
	self = this;	

	var doc = self.collection.findOne({}, {
		sort: {
			lastPing: -1,
		}
	});

	return doc;
}

// This will automatically remove dominator logs
// to prevent database from getting too big
dominator.purge = function () {
	Meteor.setTimeout(function () {
		return self.collection.remove({
			serverId: {
				$ne: self.serverId
			}
		})
	}, 5000);
}

dominator.setAsActive = function () {
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
		});

		if (result) {
			self.lastPing = lastPing;
		}

		if (Utilities.config.autoPurge) {
			dominator.purge();
		}
		
		return result;
	} catch (e) {
		// https://www.youtube.com/watch?v=SHs6O6jC7Y8
	}
}

dominator.isActive = function () {
	var self = this;

	// since Meteor runs only one server in development,
	// we should set dominator as active immediately, otherwise 
	// it would wait the `lastPing` to surpass `maxWait` 
	if (Meteor.isDevelopment && !Utilities.config.disableDevelopmentMode) {
		return self.setAsActive();
	}

	// if the last ping was less than 10 seconds ago, 
	// then assume that server is dominant
	if (self.lastPing && Utilities.config.gracePeriod) {
		var gracePeriod = new Date(self.lastPing);
		gracePeriod = gracePeriod.setSeconds(gracePeriod.getSeconds() + Utilities.config.gracePeriod);

		if (new Date() < gracePeriod) {
			return true;
		}
	}

	// then business as usual
	var doc = self.getActive();

	// if the doc is itself, maintain dominance
	if (!doc || doc.serverId === self.serverId) {
		return self.setAsActive();
	} 

	// if a server isn't maintaining dominance, take it
	var timeGap = new Date () - doc.lastPing;
	var maxTimeGap = Utilities.config.maxWait;

	if (timeGap >= maxTimeGap) {
		return self.setAsActive();
	}
}

dominator.reset =  function () {
	self = this;
	self.serverId = Utilities.config.getServerId(true);
}

export { dominator }