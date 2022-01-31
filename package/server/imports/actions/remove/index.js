import { Utilities } from "../../utilities"

const remove = function (job, callback) {
	let error;
	let result;
	const jobDoc = Utilities.helpers.getJob(job);

	if (typeof jobDoc === "object") {
		result = Utilities.collection.remove(jobDoc._id)
	} else {
		error = true
	}

	if (callback) callback(error, result)

	return result;
}

export { remove }