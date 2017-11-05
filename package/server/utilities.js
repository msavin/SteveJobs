Jobs.utilities = {};

Jobs.utilities.number = function (thing, note) {
	if (typeof thing === "function") {
		thing = thing();
	}

	if (typeof thing === "string") {
		thing = Number(thing);

		if (isNaN(thing)) {
			console.log("Jobs: invalid input for " + note || "number");
			return 0
		}
	}

	if (typeof thing === "number") {
		return thing;
	} else {
		console.log("Jobs: invalid input for " + note || "number");
		return 0;
	}
}

Jobs.utilities.date  = function (input1, input2) {
	var currentDate = new Date();
	var ignoreList = ["priority"]
	var action;

	if (input2) {
		try { 
			currentDate = new Date(input1);
			action = input2;
		} catch (e) {
			console.log("Jobs: Invalid date entered");
			return;
		}
	} else {
		action = input1 || {};
	}
	
	// Hacky
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
				int = currentDate.getYear() + int;
				currentDate.setYear(int);
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
				currentDate.setYear(int);
			}
		}
	}

	utilities.in.millisecond = utilities.in.milliseconds;
	utilities.in.second = utilities.in.seconds;
	utilities.in.minute = utilities.in.minutes;
	utilities.in.hour = utilities.in.hours;
	utilities.in.day = utilities.in.days;
	utilities.in.month = utilities.in.months;
	utilities.in.year = utilities.in.years;

	utilities.on.millisecond = utilities.on.milliseconds;
	utilities.on.second = utilities.on.seconds;
	utilities.on.minute = utilities.on.minutes;
	utilities.on.hour = utilities.on.hours;
	utilities.on.day = utilities.on.days;
	utilities.on.month = utilities.on.months;
	utilities.on.year = utilities.on.years;

	if (typeof action === "object") {
		Object.keys(action).forEach(function (key1) {
			if (["in","on"].indexOf(key1) > -1) {

				Object.keys(action[key1]).forEach(function (key2) {
					try {
						newNumber = Jobs.utilities.number(action[key1][key2]);
						
						if (typeof newNumber === "number") {
							utilities[key1][key2](newNumber);
						} else {
							console.log("Jobs: invalid type was inputted: " + key1 + "." + key2);	
						}
					} catch (e) {
						console.log("Jobs: invalid argument was ignored: " + key1 + "." + key2);
					}
				});

			} else if (key1  === "tz") {
				console.log("Jobs: Oooo - you found a hidden feature - timezone is not working yet!");
			} else if (ignoreList.indexOf(key1) > 0) {
				// ignore
			} else {
				console.log("Jobs: invalid argument was ignored: " + key1);
			}
		});

		return currentDate;
	} else {
		console.log("Jobs: Invalid input for second argument");
	}
}