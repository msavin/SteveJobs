import { Utilities } from '../../utilities'
import { toolbelt } from './toolbelt.js'
import { reschedule } from '../reschedule/'
import { Operator } from '../../operator'

var process = function (doc, callback) {
	// Goals: 
	// 1- Execute the job
	// 2- Update the document in database
	// 3- Capture the result (if any)

	try {
		var Toolbelt = new toolbelt(doc);
		var jobResult = Utilities.registry.data[doc.name].apply(Toolbelt, doc.arguments);

		if (typeof callback === "function") {
			return callback(undefined, jobResult);
		} else {
			return jobResult;
		}
	}

	catch (e) {		
		var Toolbelt = new toolbelt(doc);
		var failure = Toolbelt.failure();
		
		Utilities.logger("job failed to run: " + doc.name)
		console.log(e);

		if (typeof callback === "function") {
			return callback(true, undefined);
		}
	}
}

export { process }