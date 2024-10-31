import { Utilities } from "../../utilities"

const get = async function (input, verify, callback) {
	const jobDoc = await Utilities.helpers.getJob(input, {}, verify)
	if (callback) callback(undefined, jobDoc)
	return jobDoc;
}

export { get }
