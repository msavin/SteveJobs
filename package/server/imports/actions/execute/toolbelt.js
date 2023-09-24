import { Utilities } from "../../utilities"
import { Operator } from "../../operator"
import { reschedule } from "../reschedule"
import { replicate } from "../replicate/"
import { remove } from "../remove/"

const toolbelt = function (jobDoc) {
	const instance = this;
	instance.document = jobDoc;
	instance.resolved = false;

	instance.set = async (key, value) => {
		check(key, String)

		let docId = instance.document._id;
		let patch = {}
		patch["data." + key] = value;

		// first, update the document
		let update = await Utilities.collection.updateAsync(docId, {
			$set: patch
		})

		// second, patch the cached document if write is successful
		if (update) {
			instance.document.data[key] = value
		}

		// finally, return doc update ID
		return update;
	}

	instance.get = async (key, getLatestFromDatabase) => {
		check(key, String)

		let docId = instance.document._id

		if (getLatestFromDatabase) {
			// Get the latest doc
			let doc = await Utilities.collection.findOneAsync(docId);

			// Update the cached doc with the fresh copy
			if (doc) instance.document = doc;
		}

		if (instance.document.data && instance.document.data[key]) {
			return instance.document.data && instance.document.data[key];
		}
	}

	instance.push = async (key, value) => {
		check(key, String)

		let docId = instance.document._id;

		let update = await Utilities.collection.updateAsync(docId, {
			$push: {
				["data." + key]: value
			}
		})


	}

	instance.pull = async (key, value) => {
		check(key, String)

		let docId = instance.document._id;

		let update = await Utilities.collection.updateAsync(docId, {
			$pull: {
				["data." + key]: value
			}
		})
	}

	instance.pullAll = async (key, value) => {
		check(key, String)

		let docId = instance.document._id;

		let update = await Utilities.collection.updateAsync(docId, {
			$pullAll: {
				["data." + key]: value
			}
		})
	}

	instance.inc = async (key, value) => {
		check(key, String)
		check(value, Number)
		value = value || 1

		let docId = instance.document._id;

		let update = await Utilities.collection.updateAsync(docId, {
			$inc: {
				["data." + key]: value
			}
		})
	}

	instance.dec = async (key, value) => {
		check(key, String)
		check(value, Number)
		value = value || 1

		let docId = instance.document._id;

		let update = await Utilities.collection.updateAsync(docId, {
			$dec: {
				["data." + key]: value
			}
		})
	}

	instance.addToSet = async (key, value) => {
		check(key, String)
		check(value, Number)
		value = value || 1

		let docId = instance.document._id;

		let update = await Utilities.collection.updateAsync(docId, {
			$addToSet: {
				["data." + key]: value
			}
		})
	}

	instance.success = async (result) => {
		let docId = instance.document._id;

		let update = await Utilities.collection.updateAsync(docId, {
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

	instance.failure = async (result) => {
		let docId = instance.document._id;
		let queueName = instance.document.name;

		// Update the document
		let update = await Utilities.collection.updateAsync(docId, {
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

	instance.reschedule = async (config) => {
		const doc = instance.document;
		let newDate = await reschedule(doc._id, config);

		if (!newDate) {
			Utilities.logger(["Error rescheduling job: " + doc.name + "/" + doc._id, config]);
		}

		instance.resolved = true;
		return newDate;
	}

	instance.replicate = async (config) => {
		const doc = instance.document;
		const newCopy = await replicate(doc, config)

		if (!newCopy) {
			Utilities.logger(["Error cloning job: " + doc.name + "/" + doc._id, config]);
		}

		return newCopy;
	}

	instance.remove = async () => {
		const doc = instance.document;
		let removeDoc = await remove(doc._id)

		if (!removeDoc) {
			Utilities.logger(["Error removing job: " + doc.name + "/" + doc._id]);
		}

		this.resolved = true;
		return removeDoc;
	}

	instance.clearHistory = async () => {
		let docId = instance.document._id;

		let update = await Utilities.collection.updateAsync(docId, {
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
