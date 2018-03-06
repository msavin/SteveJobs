import { Utilities } from "../../utilities"

var get = function (input, verify, callback) {
	var jobDoc = Utilities.helpers.getJob(input, {}, verify)

	if (callback) {
		callback(undefined, jobDoc)
	}

	return jobDoc;
}

export { get }