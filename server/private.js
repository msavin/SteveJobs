SteveJobsUtilities = {};

// Grab the latest job

SteveJobsUtilities.getJob = function () {
	return SteveJobsData.findOne({
		due: { 
			$lt: new Date()
		},
		status: "pending"
	});
}

SteveJobsUtilities.callback = function () {
	var callback = function (e,r) {
		jobsAvailable = true;
	
		if (e) {
			console.log(e);
		} else {
			Meteor.call('v1/reminderScheduler/run');
		}
	}
}

SteveJobsUtilities.callMethod = function (methodParams) {
	// inject the callback
	methodParams.push(SteveJobsUtilities.callback);

	// run it
	Meteor.call.apply(Meteor, methodParams)
}