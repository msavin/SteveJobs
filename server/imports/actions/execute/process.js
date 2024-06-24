import { Promise } from "meteor/promise"
import { Utilities } from "../../utilities"
import { toolbelt } from "./toolbelt.js"

const process = async function (doc, callback) {
	// Goals: 
	// 1- Execute the job
	// 2- Update the document in database
	// 3- Capture the result (if any)

	const Toolbelt = new toolbelt(doc);

	try {
		const res = Utilities.registry.data[doc.name].apply(Toolbelt, doc.arguments);
		const jobResult = await (Promise.resolve(res));
		const resolution = Toolbelt.checkForResolution(jobResult);

		if (typeof callback === "function") {
			return callback(undefined, jobResult);
		} else {
			return jobResult;
		}
	} catch (error) {		
		const failure = await Toolbelt.failure(error.stack);
		
		Utilities.logger(`Job failed to run due to code error: ${doc.name}`)
		console.log(error);

		if (typeof callback === "function") {
			return callback(error, undefined);
		}
	}
}

export { process }
