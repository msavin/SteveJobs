import { Utilities } from '../../utilities'
import { Operator } from '../../operator'
import { reschedule } from '../reschedule/'

var toolbelt = function (jobDoc) {
	this.doc = jobDoc;

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

		Utilities.collection.update(docId, {
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

		return update;
	}

	this.reschedule = function (config) {
		var docId = this.doc._id;
		var newDate = reschedule(docId, config);
		return newDate;
	}
}

export { toolbelt }