import { Utilities } from "../../utilities"
import { Operator } from "../../operator"
import { reschedule } from "../reschedule/"
import { replicate } from "../replicate/"
import { remove } from "../remove/"

var toolbelt = function (jobDoc) {
	this.document = jobDoc;

	this.resolved = false; 

	this.set = function (key, value) {	
		check(key, String)

		var docId = this.document._id;
		var patch = {}
		patch["data." + key] = value;

		// first, update the document
		var update = Utilities.collection.update(docId, {
			$set: patch
		})

		// second, patch the cached document if write is successful
		if (update) {
			this.document.data[key] = value
		}

		// finally, return doc update ID
		return update;
	}

	this.get = function (key, getLatestFromDatabase) {
		check(key, String)
		var docId = this.document._id


		if (getLatestFromDatabase) {
			// Get the latest doc
			doc = Utilities.collection.findOne(docId);
			
			// Update the cached doc with the fresh copy
			if (doc) {
				this.document = doc;	
			}
		}

		return this.document.data[key];
	}

	this.push = function (key, value) {
		check(key, String)

		var docId = this.document._id;

		var update = Utilities.collection.update(docId, {
			$push: {
				["data." + key]: value
			}
		})


	}

	this.pull = function (key, value) {
		check(key, String)

		var docId = this.document._id;

		var update = Utilities.collection.update(docId, {
			$pull: {
				["data." + key]: value
			}
		})
	}

	this.pullAll = function (key, value) {
		check(key, String)

		var docId = this.document._id;

		var update = Utilities.collection.update(docId, {
			$pullAll: {
				["data." + key]: value
			}
		})
	}

	this.inc = function (key, value) {
		check(key, String)
		check(value, Number)
		value = value || 1

		var docId = this.document._id;

		var update = Utilities.collection.update(docId, {
			$inc: {
				["data." + key]: value
			}
		})
	}

	this.dec = function (key, value) {
		check(key, String)
		check(value, Number)
		value = value || 1

		var docId = this.document._id;

		var update = Utilities.collection.update(docId, {
			$dec: {
				["data." + key]: value
			}
		})
	}

	this.addToSet = function (key, value) {
		check(key, String)
		check(value, Number)
		value = value || 1

		var docId = this.document._id;

		var update = Utilities.collection.update(docId, {
			$addToSet: {
				["data." + key]: value
			}
		})
	}

	this.success = function (result) {
		var docId = this.document._id;

		var update = Utilities.collection.update(docId, {
			$set: {
				state: "success",
			}, 
			$push: {
				history: {
					date: new Date(),
					state: "success",
					serverId: Utilities.config.getServerId(),
					result: result
				}
			}
		})

		this.resolved = true;

		return update;
	}

	this.failure = function (result) {
		var docId = this.document._id;
		
		var update = Utilities.collection.update(docId, {
			$set: {
				state: "failure",
			}, 
			$push: {
				history: {
					date: new Date(),
					state: "failure",
					serverId: Utilities.config.getServerId(),
					result: result
				}
			}
		})

		this.resolved = true;

		return update;
	}

	this.reschedule = function (config) {
		var docId = this.document._id;
		var newDate = reschedule(docId, config);

		if (!newDate) {
			Utilities.logger(["Error rescheduling job: " + doc.name + "/" + docId, config]);
		}

		this.resolved = true;
		return newDate;	
	}

	this.replicate = function (config) {
		var doc = this.document;
		var newCopy = replicate(doc, config)

		if (!newCopy) {
			Utilities.logger(["Error cloning job: " + doc.name + "/" + docId, config]);
		}

		return newCopy;
	}

	this.remove = function () {
		var docId = this.document._id;
		var removeDoc = remove(docId)

		if (!removeDoc) {
			Utilities.logger(["Error removing job: " + doc.name + "/" + docId, config]);
		}

		this.resolved = true;
		return removeDoc;
	}

	this.clearHistory = function () {
		var docId = this.document._id;

		var update = Utilities.collection.update(docId, {
			$set: {
				history: [{
					date: new Date(),
					state: "cleared",
					serverId: Utilities.config.getServerId()
				}]
			}
		})

		return update;
	}

	this.checkForResolution = function () {
		var docId = this.document._id;
		var queueName = this.document.name;
		var resolution = this.resolved;

		if (!resolution) {
			Utilities.logger([
				"Job was not successfully terminated: " + queueName + ", " + docId, 
				"Every job must be resolved with this.success(), this.failure(), this.reschedule(), or this.remove()",
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
						serverId: Utilities.config.getServerId()
					}
				}
			})

			return false;
		}
	}
}

export { toolbelt }