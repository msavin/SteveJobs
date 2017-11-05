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

Jobs.private.execute = function (doc, jobCallback) {
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
					completed: new Date()
				}, 
				$push: {
					history: {
						date: new Date(),
						result: jobResult,
						state: "successful"
					}
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
				}, 
				$push: {
					history: {
						date: new Date(),
						state: "failed"
					}
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
				$set: {
					state: "cancelled"
				},
				$push: {
					history: {
						date: new Date(),
						state: "cancelled"
					}
				}
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

Jobs.private.clear = function (count, name) {

	/* Future Idea:
		- allow array as input for count and/or name
		- verify array to make sure it has allowed inputs
	*/

	var state = ["cancelled"];

	if (count >= 2) {
		state.push("successful")
	}

	if (count >= 3) {
		state.push("failed")
	} 

	if (count >= 4) {
		state.push("pending")
	} 

	if (name) {
		var result = Jobs.private.collection.remove({
			name: name,
			state: {
				$in: state
			}
		})
	} else {
		var result = Jobs.private.collection.remove({
			state: {
				$in: state
			}
		})
	}

	return result;
}

Jobs.private.start = function (doc, jobCallback) {
	if (typeof doc === "object") {
		var result = Jobs.private.execute(doc, jobCallback);
		return result;
	} else if (typeof doc === "string") {
		jobDoc = Jobs.private.collection.findOne(doc);

		if (jobDoc) {
			var result = Jobs.private.execute(jobDoc, jobCallback);
			return result;
		}
	} else {
		console.log("Jobs: Invalid input for Jobs.execute();");
		console.log(doc);
		console.log("----")
	}
}

Jobs.private.run = function () {
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
		created: new Date(),
		due: function () {
			var due = new Date();

			if (typeof config === "object") {
				if (config.in || config.on) {
					due = Jobs.utilities.date(config);
				}
			}

			return due;
		}(),
		priority: function () {
			if (typeof config === "object" && config.priority) {
				return Jobs.utilities.number(config.priority, "priority") || 0;
			} else {
				return 0;
			}
		}(),
		arguments: function () {
			argz = args.splice(0, 1)

			if (typeof config === "object") {
				if (config.in || config.on || config.priority || config.tz) {
					argz = args.splice(-1)
				}
			}
			
			return args;
		}(),
		state: "pending"
	}

	var result = Jobs.private.collection.insert(doc);
	return result;
}

// Pending:

Jobs.private.reschedule = function (jobId, config) {
	// TODO: Allow to set a new priority too? or make it a different function?

	// First, check if the doc is available
	// Second, check if the doc has ran

	var jobDoc = Jobs.private.collection.findOne(jobId);

	if (!jobDoc) {
		console.log("Jobs: no such job found: " + jobId);
		return;
	}

	if (['successful', 'cancelled'].indexOf(jobDoc.state) >= 0) {
		console.log('Jobs: job has already completed: ' + jobId);
		return;
	}
	
	// If not create the patch and update the document

	newDueDate = function () {
		var due = new Date();

		if (typeof config === "object") {
			if (config.in || config.on) {
				due = Jobs.utilities.date(config);
			}
		}

		return due;
	}()

	var update = Jobs.private.collection.update(jobId, {
		$set: {
			due: newDueDate
		},
		$push: {
			history: {
				date: new Date(),
				type: "reschedule",
				result: newDueDate
			}
		}
	})	

	return update;
}