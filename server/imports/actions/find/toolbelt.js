import { check } from "meteor/check"
import { Utilities } from "../../utilities"
import { Operator } from "../../operator"
import { reschedule } from "../reschedule/"
import { replicate } from "../replicate/"
import { remove } from "../remove/"

const toolbelt = function (jobDoc) {
	this.document = jobDoc;

	this.set = async function (key, value) {	
		check(key, String)

		var docId = this.document._id;
		var patch = {}
		patch["data." + key] = value;

		// first, update the document
		var update = await Utilities.collection.updateAsync(docId, {
			$set: patch
		})

		// second, patch the cached document if write is successful
		if (update) {
			this.document.data[key] = value
		}

		// finally, return doc update ID
		return update;
	}

	this.get = async function (key, getLatestFromDatabase) {
		check(key, String)
		const docId = this.document._id

		if (getLatestFromDatabase) {
			// Get the latest doc
			doc = await Utilities.collection.findOneAsync(docId);
			
			// Update the cached doc with the fresh copy
			if (doc) {
				this.document = doc;
			}
		}

		return this.document.data[key];
	}

	this.push = async function (key, value) {
		check(key, String)

		var docId = this.document._id;

		var update = await Utilities.collection.updateAsync(docId, {
			$push: {
				["data." + key]: value
			}
		})


	}

	this.pull = async function (key, value) {
		check(key, String)

		var docId = this.document._id;

		var update = await Utilities.collection.updateAsync(docId, {
			$pull: {
				["data." + key]: value
			}
		})
	}

	this.pullAll = async function (key, value) {
		check(key, String)

		var docId = this.document._id;

		var update = await Utilities.collection.updateAsync(docId, {
			$pullAll: {
				["data." + key]: value
			}
		})
	}

	this.inc = async function (key, value) {
		check(key, String)
		check(value, Number)
		value = value || 1

		var docId = this.document._id;

		var update = await Utilities.collection.updateAsync(docId, {
			$inc: {
				["data." + key]: value
			}
		})
	}

	this.dec = async function (key, value) {
		check(key, String)
		check(value, Number)
		value = value || 1

		var docId = this.document._id;

		var update = await Utilities.collection.updateAsync(docId, {
			$dec: {
				["data." + key]: value
			}
		})
	}

	this.addToSet = async function (key, value) {
		check(key, String)
		check(value, Number)
		value = value || 1

		var docId = this.document._id;

		var update = await Utilities.collection.updateAsync(docId, {
			$addToSet: {
				["data." + key]: value
			}
		})
	}

	this.success = async function (result) {
		var docId = this.document._id;

		var update = await Utilities.collection.updateAsync(docId, {
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

		return update;
	}

	this.failure = async function (result) {
		var docId = this.document._id;
		
		var update = await Utilities.collection.updateAsync(docId, {
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

		return update;
	}

	this.clearHistory = async function () {
		var docId = this.document._id;

		var update = await Utilities.collection.updateAsync(docId, {
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

	this.reschedule = async function (config) {
		var docId = this.document._id;
		var newDate = await reschedule(docId, config);

		if (!newDate) {
			Utilities.logger(["Error rescheduling job: " + doc.name + "/" + docId, config]);
		}

		return newDate;
	}

	this.replicate = async function (config) {
		var doc = this.document;
		var newCopy = await replicate(doc, config)

		if (!newCopy) {
			Utilities.logger(["Error cloning job: " + doc.name + "/" + docId, config]);
		}

		return newCopy;
	}

	this.remove = async function () {
		var docId = this.document._id;
		var removeDoc = await remove(docId)

		if (!removeDoc) {
			Utilities.logger(["Error removing job: " + doc.name + "/" + docId, config]);
		}

		return removeDoc;
	}
}

export { toolbelt }
