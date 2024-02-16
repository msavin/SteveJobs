import { Utilities } from "../../utilities"
import { toolbelt } from "./toolbelt.js"

const process = function (doc, callback) {
	const Toolbelt = typeof doc === "object" && new toolbelt(doc);

	try {
		callback.apply(Toolbelt, [doc]);
	} catch (e) {		
		Utilities.logger("Jobs.manage to run due to code error: " + doc.name)
		console.log(e);
	}
}

export { process }