import { Utilities } from '../../utilities'
import { Operator } from '../../operator'
import { reschedule } from '../reschedule/'

var toolbelt = function (jobDoc) {
	this.doc = jobDoc;

	this.resolved = false; 

	this.set = function (key, value) {	
		check(key, String)

		if (key.indexOf())
		var docId = this.doc._id;
		
		var patch = {}
		patch["data." + key] = value;
	
		var doc = Utilities.collection.update(docId, {
			$set: patch
		})

		return doc;
	}

	this.get = function (key) {
		check(key, String)
		
		var docId = this.doc._id;
		var result = null; 

		// Get the latest doc
		latestDoc = Utilities.collection.findOne(docId);
		
		// Update the cached doc while we're at it
		this.doc = latestDoc;
		
		// Return the result
		if (latestDoc) {
			if (latestDoc.data) {
				result = latestDoc.data;

				if (key) {
					result = latestDoc.data.key || null;
				}
			} else {
				console.log("WTF")
			}
		}
		return result;
	}

	this.success = function (result) {
		var docId = this.doc._id;

		var update = Utilities.collection.update(docId, {
			$set: {
				state: "success",
			}, 
			$push: {
				history: {
					date: new Date(),
					state: "success",
					server: Operator.dominator.serverId,
					result: result
				}
			}
		})

		this.resolved = true;

		return update;
	}

	this.failure = function (result) {
		var docId = this.doc._id;
		
		var update = Utilities.collection.update(docId, {
			$set: {
				state: "failure",
			}, 
			$push: {
				history: {
					date: new Date(),
					state: "failure",
					server: Operator.dominator.serverId,
					result: result
				}
			}
		})

		this.resolved = true;

		return update;
	}

	this.reschedule = function (config) {
		var docId = this.doc._id;
		var newDate = reschedule(docId, config);

		this.resolved = true;

		return newDate;
	}

	this.checkForResolution = function () {
		var docId = this.doc._id;
		var queueName = this.doc.name;
		var resolution = this.resolved;

		if (!resolution) {
			Utilities.logger([
				"Job was not successfully terminated: " + queueName + ", " + docId, 
				"Every job must be resolved with this.successful(), this.failure(), or this.reschedule()",
				"Queue was stopped; please re-write your function and re-start the server"
			]);

			Operator.manager.queues[queueName].stop();

			var update = Utilities.collection.update(docId, {
				$set: {
					state: "failure",
				}, 
				$push: {
					history: {
						date: new Date(),
						state: "unresolved",
						server: Operator.dominator.serverId
					}
				}
			})

			return false;
		}
	}
}

export { toolbelt }