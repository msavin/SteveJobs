import { Utilities } from "../../utilities"
import { process } from "./process.js"

const find = function () {
	// First, process the arguments
	const input = Utilities.helpers.processJobArguments(arguments);

	// Second, find an active job
	const jobDoc = Utilities.collection.findOne({
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