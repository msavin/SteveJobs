// To Do: Ensure this only runs on one server

var available = true;

Meteor.setTimeout(function () {
	if (available) {
		Meteor.call('SteveJobs/run');
	}
}, 30000);