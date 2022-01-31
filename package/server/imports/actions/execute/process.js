import { Utilities } from "../../utilities"
import { toolbelt } from "./toolbelt.js"
import { reschedule } from "../reschedule/"

const process = async function (doc, callback) {
	// Goals: 
	// 1- Execute the job
	// 2- Update the document in database
	// 3- Capture the result (if any)

	const Toolbelt = new toolbelt(doc);
	const jobFunc = Utilities.registry.data[doc.name];
	const isAsync = jobFunc.constructor.name === "AsyncFunction";

	if (isAsync) {
		await jobFunc.apply(Toolbelt, doc.arguments)
			.catch(function (error) {
				const failure = Toolbelt.failure(error);
				
				Utilities.logger(`Job failed to run due to code error: ${doc.name}`)
				console.log(error);

				if (typeof callback === "function") {
					return callback(error, undefined);
				}
			})
			.then(function (jobResult) {
				const resolution = Toolbelt.checkForResolution(jobResult);

				if (typeof callback === "function") {
					return callback(undefined, jobResult);
				} else {
					return jobResult;
				}
			});
	} else {
		try {
			const jobResult = jobFunc.apply(Toolbelt, doc.arguments);
			const resolution = Toolbelt.checkForResolution(jobResult);

			if (typeof callback === "function") {
				return callback(undefined, jobResult);
			} else {
				return jobResult;
			}
		} catch (error) {		
			const failure = Toolbelt.failure(error.stack);
			
			Utilities.logger(`Job failed to run due to code error: ${doc.name}`)
			console.log(error);

			if (typeof callback === "function") {
				return callback(error, undefined);
			}
		}
	}	
}

export { process }