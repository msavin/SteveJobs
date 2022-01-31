import { Utilities } from "../../utilities"

const cancel = function (job, callback) {
	let error;
	let result;

	const jobDoc = Utilities.helpers.getJob(job, {
		allow: ["pending", "failure"],
		message: "Unable to cancel job - not found or is resolved: "
	})

	if (typeof jobDoc === "object") {
		result = Utilities.collection.update(jobDoc._id, {
			$set: {
				state: "cancelled"
			},
			$push: {
				history: {
					date: new Date(),
					state: "cancelled",
					serverId: Utilities.config.getServerId()
				}
			}
		})
	} else {
		error = true;
	}

	if (callback) {
		callback(error, result);
	}

	return result;
}

export { cancel }