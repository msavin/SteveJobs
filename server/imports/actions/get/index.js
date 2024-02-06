import { Utilities } from "../../utilities"

const get = function (input, verify, callback) {
	const jobDoc = Utilities.helpers.getJob(input, {}, verify)
	if (callback) callback(undefined, jobDoc)
	return jobDoc;
}

export { get }