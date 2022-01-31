import { Utilities } from "../../utilities"

const clear = function (state, name, callback) {
	if (typeof state === "string" && state !== "*")  {
		state = [state]
	}

	let action = {
		state: {
			$in: state || ["cancelled", "success"]
		}
	}

	if (name && typeof name === "string") {
		action.name = name
	}

	if (name && typeof name === "object") {
		action.name = {
			$in: name
		}
	}

	if (state === "*") {
		action.state = {
			$in: ["cancelled", "success", "pending", "failure"]
		}
	}

	const result = Utilities.collection.remove(action)
	
	if (callback) {
		callback(undefined, result);
	}
	
	return result;
}

export { clear }