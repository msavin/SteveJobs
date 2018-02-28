import { Utilities } from '../../utilities'
import { processArguments } from './processArguments.js'

var add = function () {
	// 0. Prepare variables
	var error, result;

	// 1. Process arguments + prepare the data
	var input = processArguments(arguments);

	// 2. Generate job document
	var jobDoc = Utilities.helpers.generateJobDoc(input);

	// 3. Insert the job document into the database
	var jobId = Utilities.collection.insert(jobDoc);

	// 4. Simulate the document (this might save us a database request in some places)	
	if (jobId) {
		result = jobDoc;
		result._id = jobId;
		result._simulant = true;
	} else {
		error = true;
	}

	// 5. Mission accomplished
	if (typeof input.config.callback === "function") {
		return input.config.callback(error, result);
	}
	
	return resut;
}

export { add }