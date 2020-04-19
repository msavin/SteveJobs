import { Utilities } from "../../utilities"
import { toolbelt } from "./toolbelt.js"
import { reschedule } from "../reschedule/"


var process = async function (doc, callback) {
	// Goals: 
	// 1- Execute the job
	// 2- Update the document in database
	// 3- Capture the result (if any)

	var Toolbelt = new toolbelt(doc);
	var jobFunc = Utilities.registry.data[doc.name];
	var isAsync = jobFunc.constructor.name === "AsyncFunction";

	if (isAsync) {
		jobResult = await jobFunc.apply(Toolbelt, doc.arguments).catch(function (error) {
			var failure = Toolbelt.failure(error);
			
			Utilities.logger("Job failed to run due to code error: " + doc.name)
			console.log(error);

			if (typeof callback === "function") {
				return callback(true, undefined);
			}
		}).then(function (jobResult) {
			var resolution = Toolbelt.checkForResolution(jobResult);

			if (typeof callback === "function") {
				return callback(undefined, jobResult);
			} else {
				return jobResult;
			}
		});

	} else {
		try {
			const jobResult = jobFunc.apply(Toolbelt, doc.arguments);
			var resolution = Toolbelt.checkForResolution(jobResult);

			if (typeof callback === "function") {
				return callback(undefined, jobResult);
			} else {
				return jobResult;
			}
		}

		catch (e) {		
			var failure = Toolbelt.failure(e.stack);
			
			Utilities.logger("Job failed to run due to code error: " + doc.name)
			console.log(e);

			if (typeof callback === "function") {
				return callback(true, undefined);
			}
		}
	}	
}

export { process }