import { Utilities } from "../../utilities"

var remove = function (job, callback) {
	var error,
		result,
		jobDoc = Utilities.helpers.getJob(job);

	if (typeof jobDoc === "object") {
		result = Utilities.collection.remove(jobDoc._id)
	} else {
		error = true
	}

	if (callback) {
		callback(error, result)
	}

	return result;
}

export { remove }