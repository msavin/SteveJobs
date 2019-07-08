import { Utilities } from "../../utilities"
import { toolbelt } from "./toolbelt.js"

var process = function (doc, callback) {
	var Toolbelt; 

	if (typeof doc === "object") {
		Toolbelt = new toolbelt(doc);
	}

	try {
		var jobResult = callback.apply(Toolbelt, [doc]);
	}

	catch (e) {		
		Utilities.logger("Jobs.manage to run due to code error: " + doc.name)
		console.log(e);
	}
}

export { process }