// To Do: Ensure this only runs on one server
// Bonus: When it runs the last job, the package could check if there is something scheduled to run before its time out, and shorten the timeout amountAwesome. I'm a big fan of member management apps, was going to one a while back..

var available = true;

Meteor.onConnection(function(result){
    console.log(result.httpHeaders);
    console.log(result);
});


Meteor.startup(function () {
	Meteor.setTimeout(function () {
		if (available) {
			Meteor.call('SteveJobs/run');
		}
	}, 30000);
});