import { config } from "../config"
import { generateDueDate } from "./generateDueDate.js"
import { number } from "./number.js"

const generateJobDoc = function (input) {
	return {
		name: input.name,
		created: config.getDate(),
		serverId: config.getServerId(),
		state: "pending",
		due: generateDueDate(input.config),
		history: [{
			date: new Date(),
			due: generateDueDate(input.config),
			type: "created",
			serverId: config.getServerId()
		}],
		priority: function () {
			let priority = 0;

			try {
				priority = number(input.config.priority, "priority") || 0;	
			} catch (e) {
				// https://www.youtube.com/watch?v=RVmG_d3HKBA
			}

			return priority;
		}(),
		data: function () {
			let data = {}

			try {
				data = input.config.data;
			} catch (e) {

				// https://www.youtube.com/watch?v=XpdpW0z9xnQ
			}
			
			return data || {};
		}(),
		arguments: function () {
			return input.arguments || [];
		}()
	}
}

export { generateJobDoc }