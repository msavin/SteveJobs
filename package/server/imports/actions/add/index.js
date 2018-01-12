import { Utilities } from '../../utilities'
import { generateDoc } from './generateDoc.js'
import { processInput } from './processInput.js'

var add = function () {
	// 1. Convert arguments to array + prepare necessary data
	var userEntry = processInput(arguments);

	// 2. Generate job document
	var jobInfo = generateDoc(userEntry);

	// 3. Add to the database
	var jobId = Utilities.collection.insert(jobInfo);

	// 4. Simulate the document (this saves us a database request)
	var simulatedDoc = jobInfo;
	simulatedDoc._id = jobId;

	// 5. Mission accomplished
	if (typeof userEntry.config.callback === "function") {
		return userEntry.config.callback(undefined, simulatedDoc);
	} else {
		return simulatedDoc;
	}
}

export { add }