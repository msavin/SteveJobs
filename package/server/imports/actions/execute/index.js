import { Utilities } from "../../utilities"
import { process } from "./process.js"

var execute = function (job, callback) {
	var jobDoc = Utilities.helpers.getJob(job, {
		allow: ["pending", "failure"],
		message: "Job is not valid or not found, or is already resolved:"
	});

	if (typeof jobDoc === "object") {
		if (typeof Utilities.registry.data[jobDoc.name]) {
			var result = process(jobDoc, callback);
			return result;
		} else {
			Utilities.logger("Jobs: Job not found in registry: " + jobDoc.name);
			return false;
		}
	}
}

export { execute }