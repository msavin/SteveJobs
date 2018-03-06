import { Utilities } from "../../utilities"

var replicate = function (job, config, callback) {
	var error,
		result,
		jobDoc = Utilities.helpers.getJob(job);

	if (typeof jobDoc === "object") {
		var replicant = Utilities.helpers.generateJobDoc({
			name: jobDoc.name,
			arguments: jobDoc.arguments,
			config: config
		});

		replicant.parent = jobDoc._id;

		insert = Utilities.collection.insert(replicant);
	
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