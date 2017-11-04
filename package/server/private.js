Jobs = {};

Jobs.private = {};

Jobs.private.collection = new Mongo.Collection("jobs_data");

Meteor.startup(function () {
	Jobs.private.collection._ensureIndex({
		due: 1, 
		state: 1
	})
})

Jobs.private.registry = {};

Jobs.private.configuration = {
	autoStart: true,
	timer: 5 * 1000,
	activityGap: 5 * 60 * 1000,
	activityDelay: 5 * 1000
}

Jobs.private.run = function (doc, jobCallback) {
	// Goals: 
	// 1- Execute the job
	// 2- Update the document in database
	// 3- Capture the result (if any)
	
	if (typeof Jobs.private.registry[doc.name] === "function") {
		// should probably switch to
		// pending: true/false
		// ranSuccessfully: true/false 
		try {
			var jobResult = Jobs.private.registry[doc.name].apply(null, doc.arguments);

			var jobUpdate = Jobs.private.collection.update(doc._id, {
				$set: {
					state: "successful",
					lastRun: new Date(),
					completed: new Date(),
					result: jobResult
				}
			})

			if (typeof jobCallback === "function") {
				jobCallback(null, jobResult);
			} else if (typeof jobCallback !== "undefined") {
				console.log("Jobs: Invalid callback, but job still ran");
				console.log("----")
			}
		} catch (e) {
			console.log(e);
			var jobUpdate = Jobs.private.collection.update(doc._id, {
				$set: {
					lastRun: new Date(),
					lastServer: JobsControl.serverId,
					state: "failed"
				}
			});

			if (jobUpdate) {
				console.log("Jobs: Job failed to run: " + doc.name)
			}

			if (typeof jobCallback === "function") {
				jobCallback(true, null)
			} else if (typeof jobCallback !== "undefined") {
				console.log("Jobs: Invalid callback, but job still ran");
				console.log("----")
			}
		}
	} else {
		console.log("Jobs: Job not found in registry: " + doc.name);
	}
}

Jobs.private.cancel = function (id) {
	job = Jobs.private.collection.findOne(id)

	if (job) {
		if (job.state === "pending" || job.state === "failed") {
			result = Jobs.private.collection.update(id, {
				state: "cancelled"
			})

			return result;
		} else {
			console.log("Jobs: Cancel failed for " + id);
			console.log("Jobs: Job has completed successful or is already cancelled.");
			console.log("----");
			return false;
		}
	} else {
		console.log("Jobs: Cancel failed for " + id);
		console.log("Jobs: No such job found.");
		console.log("----");
		return false;
	}
}

Jobs.private.clear = function (failed, pending) {
	var state = ["successful", "cancelled"];

	if (failed) {
		state.push("failed")
	} 

	if (pending) {
		state.push("pending")
	} 

	var result = Jobs.private.collection.remove({
		state: {
			$in: state
		}
	})

	return result;
}

Jobs.private.start = function (doc, jobCallback) {
	if (typeof doc === "object") {
		var result = Jobs.private.run(doc, jobCallback);
		return result;
	} else if (typeof doc === "string") {
		jobDoc = Jobs.private.collection.findOne(doc);

		if (jobDoc) {
			var result = Jobs.private.run(jobDoc, jobCallback);
			return result;
		}
	} else {
		console.log("Jobs: Invalid input for Jobs.run();");
		console.log(doc);
		console.log("----")
	}
}

Jobs.private.add = function () {
	// 0. Convert arguments to array + prepare necessary data
	var args = Array.prototype.slice.call(arguments);
	var config = args[args.length - 1];

	// 1. Check that the job being added exists
	if (!Jobs.private.registry[args[0]]) {
		console.log("Jobs: Invalid job name: " + job.name);
		console.log("----");
	}

	// 2. Ready set fire
	var doc = {
		name: args[0],
		due: function () {
			var due = new Date();

			if (typeof config === "object") {
				if (config.in || config.on) {
					due = Jobs.private.date(config);
				}
			}

			return due;
		}(),
		priority: function () {
			if (typeof config === "object" && config.priority) {
				return Jobs.private.number(config.priority, "priority") || 0;
			}
		}(),
		arguments: function () {
			args.splice(0, 1)
			return args;
		}(),
		state: "pending"
	}

	var result = Jobs.private.collection.insert(doc);
	return result;
}

Jobs.private.number = function (thing, note) {
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

Jobs.private.date  = function (input1, input2) {
	var currentDate = new Date();
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
						if (typeof action[key1][key2] === "number") {
							utilities[key1][key2](action[key1][key2]);
						} else {
							console.log("Jobs: invalid type was inputted: " + key1 + "." + key2);	
						}
					} catch (e) {
						console.log("Jobs: invalid argument was ignored: " + key1 + "." + key2);
					}
				});

			} else if (key1  === "tz" ) {
				console.log("Jobs: Oooo - you found a hidden feature - timezone is not working yet!");
			} else {
				console.log("Jobs: invalid argument was ignored: " + key1);
			}
		});

		return currentDate;
	} else {
		console.log("Jobs: Invalid input for second argument");
	}
}