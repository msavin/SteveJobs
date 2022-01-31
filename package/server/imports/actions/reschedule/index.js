import { Utilities } from "../../utilities"

const reschedule = function (job, config, callback) {
	let error;
	let result;
	
	const jobDoc = Utilities.helpers.getJob(job, {
		allow: ["pending", "failure"],
		message: 'Unable to reschedule. Job does not exist or has been resolved: '
	});

	if (typeof jobDoc === "object") {
		// First, prepare the update
		const dbUpdate = {
			$set: {
				state: "pending"
			},
			$push: {
				history: {
					date: new Date(),
					type: "reschedule",
					serverId: Utilities.config.getServerId()
				}
			}
		}

		// Second, set the priority, if any
		if (config && config.priority) {
			const val = Utilities.helpers.number(config.priority, "priority") || 0;
			dbUpdate.$set.priority = val;
			dbUpdate.$push.history.newPriority = val;
		}

		// Third, create a new date, if any
		// ++ base it on the job docs original due date if a date is not passed in
		if (!config.date) config.date = jobDoc.due

		const val = Utilities.helpers.generateDueDate(config);
		dbUpdate.$set.due = val;
		dbUpdate.$push.history.newDue = val;

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
