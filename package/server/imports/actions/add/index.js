import { Utilities } from "../../utilities"

var add = function () {
	// 0. Prepare variables
	var error, result, blockAdd;

	// 1. Process arguments + prepare the data
	var input = Utilities.helpers.processJobArguments(arguments);

	// 2 - check if job needs to blocked from being added

		// 2-1. check if the job is singular
		if (input.config && input.config.singular) {
			var doc = Utilities.collection.findOne({
				name: input.name,
				arguments: input.arguments,
				state: {
					$in: ["pending", "failure"]
				}
			})

			if (doc) blockAdd = true
		}

		// 2-2. check if job is unique
		if (input.config && input.config.unique) {
			var doc = Utilities.collection.findOne({
				name: input.name,
				arguments: input.arguments
			})

			if (doc) blockAdd = true
		}

		// 2-3. Cancel the job if a block condition is met
		if (blockAdd) {
			error = true;
			if (input.config && typeof input.config.callback === "function") {
				return input.config.callback(error, result);
			}
			return result;
		}
	
	// 3. Generate job document
	var jobDoc = Utilities.helpers.generateJobDoc(input);

	// 4. Insert the job document into the database OR update it
	var jobId;

	if (input.config && input.config.override) { 
		var doc = Utilities.collection.findOne({
			name: input.name,
			arguments: input.arguments,
			state: {
				$in: ["pending", "failure"]
			}
		})

		if (doc) {
			console.log(doc)
			var initDate = jobDoc.due || new Date;

			jobId = Utilities.collection.update(doc._id, {
				$set: {
					due: initDate,
					priority: jobDoc.priority,
					updated: jobDoc.created,
					data: jobDoc.data,
				},
				$push: {
					history: {
						date: initDate,
						state: "pending",
						serverId: Utilities.config.getServerId(),
						result: "Jobs/JobOveride"
					}
				}
			});

		} else {
			jobId = Utilities.collection.insert(jobDoc);	
		}
	} else {
		jobId = Utilities.collection.insert(jobDoc);	
	}
	
	// 5. Simulate the document (this might save us a database request in some places)	
	if (jobId) {
		result = jobDoc;
		result._id = jobId;
		result._simulant = true;
	} else {
		error = true;
	}

	// 6. Mission accomplished
	if (input.config && typeof input.config.callback === "function") {
		input.config.callback(error, result);
	}
	
	return result;
}

export { add }