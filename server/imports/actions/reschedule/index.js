import { Utilities } from '../../utilities'

getJob = function (jobId) {
	var jobDoc = Utilities.collection.findOne(jobId);

	// Second, check if its possible to reschedule the document
	if (!jobDoc) {
		Utilities.logger("no such job found: " + jobId);
		return false;
	} else if (['success', 'cancelled'].indexOf(jobDoc.state) >= 0) {
		Utilities.logger('job has already completed: ' + jobId);
		return false;
	} else {
		return jobDoc;
	}
}

reschedule = function (jobId, config) {
	// First, check if the doc is available
	var jobDoc = getJob(jobId);

	if (!jobDoc) {
		return false; 
	}

	// Second, prepare the update
	var jobUpdate = {
		$set: {},
		$push: {
			history: {
				date: new Date(),
				type: "reschedule",
			}
		}
	}

	// Third, prepare the priority, if any
	var determineNewPriority = function () {
		if (config.priority) {
			var val = Utilities.number(config.priority, "priority") || 0;
			jobUpdate.$set.priority = val;
			jobUpdate.$push.history.newPriority = val;
		}
	}();

	// Fourth, create the new date, if any
	var newDueDate = function () {
		var val = Utilities.helpers.generateDueDate(config);
		jobUpdate.$set.due = val;
		jobUpdate.$push.history.newDue = val;
	}();

	// Finally, run the update
	var update = Utilities.collection.update(jobId, jobUpdate)	
	return update;
}

export { reschedule }