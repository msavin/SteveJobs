import { Utilities } from "../../utilities"

reschedule = function (job, config, callback) {
	var error,
		result,
		jobDoc = Utilities.helpers.getJob(job, {
			allow: ["pending", "failure"],
			message: 'Unable to reschedule. Job does not exist or has been resolved: '
		});

	if (typeof jobDoc === "object") {
		// First, prepare the update
		var dbUpdate = {
			$set: {},
			$push: {
				history: {
					date: new Date(),
					type: "reschedule",
					serverId: Utilities.config.getServerId()
				}
			}
		}

		// Second, set the priority, if any
		var determineNewPriority = function () {
			if (config && config.priority) {
				var val = Utilities.helpers.number(config.priority, "priority") || 0;
				dbUpdate.$set.priority = val;
				dbUpdate.$push.history.newPriority = val;
			}
		}();

		// Third, create a new date, if any
		var newDueDate = function () {
			var val = Utilities.helpers.generateDueDate(config);
			dbUpdate.$set.due = val;
			dbUpdate.$push.history.newDue = val;
		}();

		// Finally, run the update
		result = Utilities.collection.update(jobDoc._id, dbUpdate)
	} else {
		error = true
	}

	// and job finished 
	if (callback) {
		callback(error, result);
	}

	return result;
}

export { reschedule }