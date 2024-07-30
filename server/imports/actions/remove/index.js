import { Utilities } from "../../utilities"

const remove = async function (job, callback) {
	let error;
	let result;
	const jobDoc = await Utilities.helpers.getJob(job);

	if (typeof jobDoc === "object") {
		result = await Utilities.collection.removeAsync(jobDoc._id)
	} else {
		error = true
	}

	if (callback) callback(error, result)

	return result;
}

export { remove }
