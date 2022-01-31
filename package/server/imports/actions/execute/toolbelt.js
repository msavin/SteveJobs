import { Utilities } from "../../utilities"
import { Operator } from "../../operator"
import { reschedule } from "../reschedule"
import { replicate } from "../replicate/"
import { remove } from "../remove/"

const toolbelt = function (jobDoc) {
	const instance = this;
	instance.document = jobDoc;
	instance.resolved = false;

	instance.set = (key, value) => {
		check(key, String)

		let docId = instance.document._id;
		let patch = {}
		patch["data." + key] = value;

		// first, update the document
		let update = Utilities.collection.update(docId, {
			$set: patch
		})

		// second, patch the cached document if write is successful
		if (update) {
			instance.document.data[key] = value
		}

		// finally, return doc update ID
		return update;
	}

	instance.get = (key, getLatestFromDatabase) => {
		check(key, String)

		let docId = instance.document._id

		if (getLatestFromDatabase) {
			// Get the latest doc
			let doc = Utilities.collection.findOne(docId);
			
			// Update the cached doc with the fresh copy
			if (doc) instance.document = doc;
		}
		
		if (instance.document.data && instance.document.data[key]) {
			return instance.document.data && instance.document.data[key];	
		}
	}

	instance.push = (key, value) => {
		check(key, String)

		let docId = instance.document._id;

		let update = Utilities.collection.update(docId, {
			$push: {
				["data." + key]: value
			}
		})


	}

	instance.pull = (key, value) => {
		check(key, String)

		let docId = instance.document._id;

		let update = Utilities.collection.update(docId, {
			$pull: {
				["data." + key]: value
			}
		})
	}

	instance.pullAll = (key, value) => {
		check(key, String)

		let docId = instance.document._id;

		let update = Utilities.collection.update(docId, {
			$pullAll: {
				["data." + key]: value
			}
		})
	}

	instance.inc = (key, value) => {
		check(key, String)
		check(value, Number)
		value = value || 1

		let docId = instance.document._id;

		let update = Utilities.collection.update(docId, {
			$inc: {
				["data." + key]: value
			}
		})
	}

	instance.dec = (key, value) => {
		check(key, String)
		check(value, Number)
		value = value || 1

		let docId = instance.document._id;

		let update = Utilities.collection.update(docId, {
			$dec: {
				["data." + key]: value
			}
		})
	}

	instance.addToSet = (key, value) => {
		check(key, String)
		check(value, Number)
		value = value || 1

		let docId = instance.document._id;

		let update = Utilities.collection.update(docId, {
			$addToSet: {
				["data." + key]: value
			}
		})
	}

	instance.success = (result) => {
		let docId = instance.document._id;

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

		instance.resolved = true;

		return update;
	}

	instance.failure = (result) => {
		let docId = instance.document._id;
		let queueName = instance.document.name;

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

		instance.resolved = true;

		return update;
	}

	instance.reschedule = (config) => {
		const doc = instance.document;
		let newDate = reschedule(doc._id, config);

		if (!newDate) {
			Utilities.logger(["Error rescheduling job: " + doc.name + "/" + doc._id, config]);
		}

		instance.resolved = true;
		return newDate;
	}

	instance.replicate = (config) => {
		const doc = instance.document;
		const newCopy = replicate(doc, config)

		if (!newCopy) {
			Utilities.logger(["Error cloning job: " + doc.name + "/" + doc._id, config]);
		}

		return newCopy;
	}

	instance.remove = () => {
		const doc = instance.document;
		let removeDoc = remove(doc._id)

		if (!removeDoc) {
			Utilities.logger(["Error removing job: " + doc.name + "/" + doc._id]);
		}

		this.resolved = true;
		return removeDoc;
	}

	instance.clearHistory = () => {
		let docId = instance.document._id;

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

	instance.checkForResolution = (result) => {
		let docId = instance.document._id;
		let resolution = instance.resolved;

		if (!resolution) instance.success(result)
	}
}

export { toolbelt }
