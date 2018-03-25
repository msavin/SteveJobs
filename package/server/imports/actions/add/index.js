import { Utilities } from "../../utilities"
import { processArguments } from "./processArguments.js"

var add = function () {
	// 0. Prepare variables
	var error, result, existingDoc;

	// 1. Process arguments + prepare the data
	var input = processArguments(arguments);

	// 2-1. check if the job is singular
	if (input.config && input.config.singular) {
		existingDoc = Utilities.collection.findOne({
			name: input.name,
			arguments: input.arguments,
			state: {
				$in: ["pending", "failure"]
			}
		})
	}

	// 2-2. Cancel the job if it exists
	if (existingDoc) {
		return;
	}
	
	// 3. Generate job document
	var jobDoc = Utilities.helpers.generateJobDoc(input);

	// 4. Insert the job document into the database
	var jobId = Utilities.collection.insert(jobDoc);

	// 5. Simulate the document (this might save us a database request in some places)	
	if (jobId) {
		result = jobDoc;
		result._id = jobId;
		result._simulant = true;
	} else {
		error = true;
	}

	// 6. Mission accomplished
	if (typeof input.config.callback === "function") {
		input.config.callback(error, result);
	}
	
	return result;
}

export { add }