import { logger } from '../logger'
import { date } from './date.js'

generateDueDate = function (config) {
	var due = new Date();

	if (config && config.date) {
		if (typeof config.date.getDate === "function") {
			due = config.date;	
		} else {
			logger("Invalid input for 'date' field. Used current date instead.")
		}
	}

	if (typeof config === "object") {
		if (config.in || config.on) {
			due = date(due, config);
		}
	}

	return due;
}

export { generateDueDate }