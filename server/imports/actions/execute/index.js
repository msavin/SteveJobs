import { Utilities } from '../../utilities'
import { process } from './process.js'

var execute = function (job, callback) {
	
	// 1. Get the job Document
	if (typeof job === "string") {
		job = Utilities.collection.findOne({ 
			_id: job,
			state: {
				$nin: ["success", "cancelled"]
			}
		});
	}

	// 2. ...
	if (typeof job === "object") {
		if (typeof Utilities.registry.data[job.name]) {
			var result = process(job, callback);
			return result;
		} else {
			Utilities.logger("Jobs: Job not found in registry: " + doc.name);
			return false;
		}
	} else {
		Utilities.logger(["Job not valid or not found:", job]);
		return false;
	}
}

export { execute }