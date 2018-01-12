import { Utilities } from '../../utilities'

var clear = function (state, name) {
	action = {
		state: {
			$in: state || ["cancelled", "success"]
		}
	}

	if (typeof name === "string") {
		action.name = name
	}

	if (typeof name === "object") {
		action.name = {
			$in: name
		}
	}

	if (state === "*") {
		action = {
			state: {
				$in: ["cancelled", "success", "pending", "failure"]
			}
		}
	}

	var result = Utilities.collection.remove(action)
	
	return result;
}

export { clear }