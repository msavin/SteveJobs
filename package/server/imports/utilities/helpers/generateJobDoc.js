import { config } from "../config"
import { generateDueDate } from "./generateDueDate.js"
import { number } from "./number.js"

var generateJobDoc = function (input) {
	return {
		name: input.name,
		created: config.getDate(),
		serverId: config.getServerId(),
		state: "pending",
		due: function () {
			return generateDueDate(input.config)
		}(),
		priority: function () {
			var priority = 0;

			try {
				priority = number(input.config.priority, "priority") || 0;	
			} catch (e) {
				// https://www.youtube.com/watch?v=RVmG_d3HKBA
			}

			return priority;
		}(),
		data: function () {
			data = {}

			try {
				data = input.config.data;
			} catch (e) {
				// https://www.youtube.com/watch?v=XpdpW0z9xnQ
			}
			
			return data;
		}(),
		arguments: function () {
			return input.arguments || [];
		}()
	}
}

export { generateJobDoc }