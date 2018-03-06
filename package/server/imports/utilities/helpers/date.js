import { number } from "./number.js"
import { logger } from "../logger"
import { config } from "../config"

var date = function (input1, input2) {
	var currentDate = config.getDate()
	var action;

	// Get the inputs straightened out
	if (input2) {
		try { 
			currentDate = new Date(input1);
			action = input2;
		} catch (e) {
			logger("Invalid date entered.");
			return;
		}
	} else {
		action = input1 || {};
	}

	// Prepare the options
	var utilities = {
		in: {
			milliseconds: function (int) {
				int = currentDate.getMilliseconds() + int;
				currentDate.setMilliseconds(int);
			},
			seconds: function (int) {
				int = currentDate.getSeconds() + int;
				currentDate.setSeconds(int);
			},
			minutes: function (int) {
				int = currentDate.getMinutes() + int;
				currentDate.setMinutes(int);
			},
			hours: function (int) {
				int = currentDate.getHours() + int;
				currentDate.setHours(int);
			},
			days: function (int) {
				int = currentDate.getDate() + int;
				currentDate.setDate(int);
			},
			months: function (int) {
				int = currentDate.getMonth() + int;
				currentDate.setMonth(int);
			},
			years: function (int) {
				int = currentDate.getFullYear() + int;
				currentDate.setFullYear(int);
			},
			millisecond: function (int) {
				return this.milliseconds(int);
			},
			second: function (int) {
				return this.seconds(int);
			},
			minute: function (int) {
				return this.minutes(int);
			},
			hour: function (int) {
				return this.hours(int);
			},
			day: function (int) {
				return this.days(int);
			},
			month: function (int) {
				return this.months(int);
			},
			year: function (int) {
				return this.years(int);
			}
		},
		on: {
			milliseconds: function (int) {
				currentDate.setMilliseconds(int);
			},
			seconds: function (int) {
				currentDate.setSeconds(int);
			},
			minutes: function (int) {
				currentDate.setMinutes(int);
			},
			hours: function (int) {
				currentDate.setHours(int);
			},
			days: function (int) {
				currentDate.setDate(int);
			},
			months: function (int) {
				currentDate.setMonth(int);
			},
			years: function (int) {
				currentDate.setFullYear(int);
			},
			millisecond: function (int) {
				return this.milliseconds(int);
			},
			second: function (int) {
				return this.seconds(int);
			},
			minute: function (int) {
				return this.minutes(int);
			},
			hour: function (int) {
				return this.hours(int);
			},
			day: function (int) {
				return this.days(int);
			},
			month: function (int) {
				return this.months(int);
			},
			year: function (int) {
				return this.years(int);
			}
		}
	}

	// Run the magic (if possible ;)

	if (typeof action === "object") {

		Object.keys(action).forEach(function (key1) {
			if (["in","on"].indexOf(key1) > -1) {
				Object.keys(action[key1]).forEach(function (key2) {
					try {
						newNumber = number(action[key1][key2]);
						
						if (typeof newNumber === "number") {
							utilities[key1][key2](newNumber);
						} else {
							logger("invalid type was inputted: " + key1 + "." + key2);	
						}
					} catch (e) {
						logger("invalid argument was ignored: " + key1 + "." + key2);
					}
				});
			}
		});

		return currentDate;
	} else {
		logger("Invalid argument(s) for date generator");
	}
}

export { date }