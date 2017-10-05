Jobs.internal = {};

Jobs.internal.data = new Mongo.Collection("simpleJobs");

Jobs.internal.getJob = function () {
	return SteveJobsData.findOne({
		due: { 
			$lt: new Date()
		},
		status: "pending"
	});
}

Jobs.internal.callback = function () {
	var callback = function (e,r) {
		jobsAvailable = true;
	
		if (e) {
			console.log(e);
		} else {
			Meteor.call('v1/reminderScheduler/run');
		}
	}
}

Jobs.internal.callMethod = function (methodParams) {
	// inject the callback
	methodParams.push(SteveJobsUtilities.callback);

	// run it
	Meteor.call.apply(Meteor, methodParams)
}

Jobs.internal.markAsComplete = function (id) {
	// Assume success, and remove the reminder
	return SteveJobsData.update(id, {
		$set: {
			status: "sent"
		}
	});
}


Jobs.internal.run = function (id) {
	// Make sure scheduler doesn't run multiple times
	jobsAvailable = false;
	
	// Grab one document that is pending
	var reminder = id || SteveJobsUtilities.getJob;

	if (reminder) {
		SteveJobsUtilities.callMethod(reminder.method);
	}
},

