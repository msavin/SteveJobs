import { Utilities } from "../../utilities"

const replicate = async function (job, config, callback) {
	let error;
	let result;
	const jobDoc = await Utilities.helpers.getJob(job);

	if (typeof jobDoc === "object") {
		const replicant = Utilities.helpers.generateJobDoc({
			name: jobDoc.name,
			arguments: jobDoc.arguments,
			config: config
		});

		replicant.parent = jobDoc._id;

		const insert = await Utilities.collection.insertAsync(replicant);
	
		// simulate the newly inserted document
		result = function () {
			if (insert) {
				replicant._id = insert;
				replicant._simulant = true;
				return replicant;
			}
		}();
	} else {
		error = true;
	}

	// run the callback and return
	if (callback) {
		callback(error, result)
	}

	return result;
}

export { replicate }
