import { Utilities } from "../../utilities"
import { process } from "./process.js"

var find = function () {
	// First, process the arguments
	var input = Utilities.helpers.processJobArguments(arguments);

	// Second, find an active job
	var jobDoc = Utilities.collection.findOne({
		name: input.name,
		arguments: input.arguments,
		state: {
			$in: ["pending", "failure"]
		}
	})

	// Third, run the described callback
	if (typeof input.callback === "function") {
		process(jobDoc, input.callback);
	}
}

export { find }