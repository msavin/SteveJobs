import { Utilities } from "../../utilities"
import { Operator } from "../../operator"
import { reschedule } from "../reschedule"
import { replicate } from "../replicate/"
import { remove } from "../remove/"

let toolbelt = function (jobDoc) {
	this.document = jobDoc;
	this.resolved = false;

	this.set = function (key, value) {
		check(key, String)

		let docId = this.document._id;
		let patch = {}
		patch["data." + key] = value;

		// first, update the document
		let update = Utilities.collection.update(docId, {
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
		let docId = this.document._id


		if (getLatestFromDatabase) {
			// Get the latest doc
			let doc = Utilities.collection.findOne(docId);
			
			// Update the cached doc with the fresh copy
			if (doc) {
				this.document = doc;
			}
		}

		return this.document.data[key];
	}

	this.push = function (key, value) {
		check(key, String)

		let docId = this.document._id;

		let update = Utilities.collection.update(docId, {
			$push: {
				["data." + key]: value
			}
		})


	}

	this.pull = function (key, value) {
		check(key, String)

		let docId = this.document._id;

		let update = Utilities.collection.update(docId, {
			$pull: {
				["data." + key]: value
			}
		})
	}

	this.pullAll = function (key, value) {
		check(key, String)

		let docId = this.document._id;

		let update = Utilities.collection.update(docId, {
			$pullAll: {
				["data." + key]: value
			}
		})
	}

	this.inc = function (key, value) {
		check(key, String)
		check(value, Number)
		value = value || 1

		let docId = this.document._id;

		let update = Utilities.collection.update(docId, {
			$inc: {
				["data." + key]: value
			}
		})
	}

	this.dec = function (key, value) {
		check(key, String)
		check(value, Number)
		value = value || 1

		let docId = this.document._id;

		let update = Utilities.collection.update(docId, {
			$dec: {
				["data." + key]: value
			}
		})
	}

	this.addToSet = function (key, value) {
		check(key, String)
		check(value, Number)
		value = value || 1

		let docId = this.document._id;

		let update = Utilities.collection.update(docId, {
			$addToSet: {
				["data." + key]: value
			}
		})
	}

	this.success = function (result) {
		let docId = this.document._id;

		let update = Utilities.collection.update(docId, {
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
		let docId = this.document._id;
		let queueName = this.document.name;

		// Update the document
		let update = Utilities.collection.update(docId, {
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

		// Stop the queue
		Utilities.logger([
			"Job has failed: " + queueName + ", " + docId,
			"Queue was stopped; please correct your job function and restart the server"
		]);

		Operator.manager.queues[queueName].stop();

		this.resolved = true;

		return update;
	}

	this.reschedule = function (config) {
		const doc = this.document;
		let newDate = reschedule(doc._id, config);

		if (!newDate) {
			Utilities.logger(["Error rescheduling job: " + doc.name + "/" + doc._id, config]);
		}

		this.resolved = true;
		return newDate;
	}

	this.replicate = function (config) {
		const doc = this.document;
		const newCopy = replicate(doc, config)

		if (!newCopy) {
			Utilities.logger(["Error cloning job: " + doc.name + "/" + doc._id, config]);
		}

		return newCopy;
	}

	this.remove = function () {
		const doc = this.document;
		let removeDoc = remove(doc._id)

		if (!removeDoc) {
			Utilities.logger(["Error removing job: " + doc.name + "/" + doc._id]);
		}

		this.resolved = true;
		return removeDoc;
	}

	this.clearHistory = function () {
		let docId = this.document._id;

		let update = Utilities.collection.update(docId, {
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

	this.checkForResolution = function (result) {
		let docId = this.document._id;
		let resolution = this.resolved;


		if (!resolution) this.success(result)
	}
}

export { toolbelt }
