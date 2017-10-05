SteveJobsData = new Mongo.Collection("simpleJobs");

// Public API 

Jobs = {
	'markAsComplete': function (id) {
		// Assume success, and remove the reminder
		return SteveJobsData.update(id, {
			$set: {
				status: "sent"
			}
		});
	},
	'run': function () {
		// Make sure scheduler doesn't run multiple times
		jobsAvailable = false;
		
		// Grab one document that is pending
		var reminder = SteveJobsUtilities.getJob;

		if (reminder) {
			SteveJobsUtilities.callMethod(reminder.method);
		}
	},
	'add': function (due, method) {
		return SteveJobsData.insert({
			due: due,
			method: method
		});
	}
};