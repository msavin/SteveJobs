Jobs = {};

Jobs.private = {};

Jobs.private.collection = new Mongo.Collection("simpleJobs");

Meteor.startup(function () {
	Jobs.private.collection._ensureIndex({
		due: 1, 
		state: 1
	})
})

Jobs.private.registry = {};

Jobs.private.configuration = {
	timer: 5 * 1000,
	activityGap: 5 * 60 * 1000,
	activityDelay: 5 * 1000
}

Jobs.private.run = function (doc, callback) {
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

			if (typeof callback === "function") {
				callback(null, jobResult);
			} else if (typeof callback !== "undefined") {
				console.log("Jobs: Invalid callback, but job still ran");
				console.log("----")
			}
		} catch (e) {
			var jobUpdate = Jobs.private.collection.update(doc._id, {
				$set: {
					lastRun: new Date(),
					state: "failed"
				}
			});

			if (jobUpdate) {
				console.log("Jobs: Job failed to run: " + doc.name)
			}

			if (typeof callback === "function") {
				callback(e, null)
			} else if (typeof callback !== "undefined") {
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

	Jobs.remove({
		state: state
	})
}

Jobs.private.start = function (doc, callback) {
	if (!JobsRunner.available) {
		console.log("Jobs: Could not run job because job queue is busy");
		return;
	}

	if (typeof doc === "object") {
		Jobs.private.run(doc, callback)
	} else if (typeof doc === "string") {
		jobDoc = Jobs.private.collection.findOne(doc);

		if (jobDoc) {
			Jobs.private.run(jobDoc, callback);
		}
	} else {
		console.log("Jobs: Invalid input for Jobs.run();");
		console.log(doc);
		console.log('----')
	}
}

Jobs.private.add = function () {
	// 1. Check that the job being added exists
		if (!Jobs.private.registry[arguments[0]]) {
			console.log("Jobs: Invalid job name: " + job.name);
			console.log("----");
		}

	// 2. Ready set fire

		var doc = {
			name: arguments[0],
			due: function () {
				var run = new Date();

				if (typeof arguments[arguments.length] === "object") {
					if (arguments[arguments.length].in || arguments[arguments.length].on) {
						run = Jobs.private.date(arguments[arguments.length]);
					}
				}

				return run
			}(),
			arguments: function () {
				return arguments.splice(0, 1)
			}(),
			state: "pending"
		}

		var result = Jobs.private.collection.insert(doc);
		return result;
}
Jobs.private.date  = function (input1, input2) {
	var currentDate = new Date();
	var action;

	if (input2) {
		try { 
			currentDate = new Date(input1);
			action = input2;
		} catch (e) {
			console.log("DateFunc: Invalid date entered");
			return;
		}
	} else {
		action = input1 || {};
	}
	
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
			day: function (int) {
				int = currentDate.getDate() + int;
				currentDate.setDate(int);
			},
			month: function (int) {
				int = currentDate.getMonth() + int;
				currentDate.setMonth(int);
			},
			year: function (int) {
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
			day: function (int) {
				currentDate.setDate(int);
			},
			month: function (int) {
				currentDate.setMonth(int);
			},
			year: function (int) {
				currentDate.setYear(int);
			}
		}
	}

	if (typeof action === "object") {
		Object.keys(action).forEach(function (key1) {
			if (["in","on"].indexOf(key1) > -1) {

				Object.keys(action[key1]).forEach(function (key2) {
					try {
						if (typeof action[key1][key2] === "number") {
							utilities[key1][key2](action[key1][key2]);
						} else {
							console.log("DateFunc: invalid type was inputted: " + key1 + "." + key2);	
						}
					} catch (e) {
						console.log("DateFunc: invalid argument was ignored: " + key1 + "." + key2);
					}
				});

			} else if (key1  === "tz" ) {
				console.log("DateFunc: Oooo - you found a hidden feature - timezone is not working yet!");
			} else {
				console.log("DateFunc: invalid argument was ignored: " + key1);
			}
		});

		return currentDate;
	} else {
		console.log("DateFunc: Invalid input for second argument");
	}
}