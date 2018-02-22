import { logger } from '../logger'
import { date } from './date.js'
import { config } from '../config'

generateDueDate = function (configObj) {
	var due = config.getDate();

	if (configObj && configObj.date) {
		if (typeof configObj.date.getDate === "function") {
			due = configObj.date;	
		} else {
			logger("Invalid input for 'date' field. Used current date instead.")
		}
	}

	if (typeof configObj === "object") {
		if (configObj.in || configObj.on) {
			due = date(due, configObj);
		}
	}

	return due;
}

export { generateDueDate }