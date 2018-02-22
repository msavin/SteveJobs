import { Utilities } from '../../utilities'
import { processArguments } from './processArguments.js'

var add = function () {
	// 1. Process arguments + prepare the data
	var userEntry = processArguments(arguments);

	// 2. Generate job document
	var jobDoc = Utilities.helpers.generateJobDoc(userEntry);

	// 3. Insert the job document into the database
	var dbInsert = Utilities.collection.insert(jobDoc);

	// 4. Simulate the document (this might save us a database request in some places)
	var simulant;
	
	if (dbInsert) {
		simulant = jobDoc;
		simulant._id = dbInsert;
		simulant._simulant = true;
	}

	// 5. Mission accomplished
	if (typeof userEntry.config.callback === "function") {
		return userEntry.config.callback(undefined, simulant);
	}
	
	return simulant;
}

export { add }