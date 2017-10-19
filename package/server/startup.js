/* 
	Since packages load first, we need to add a slight delay to the startup
	in order to let the end-users startupDelay value register
*/

Meteor.startup(function () {
	Meteor.setTimeout(function () {
		var delay = Jobs.private.configuration.activityDelay;

		Meteor.setTimeout(function () {
			JobsRunner.start();
		}, delay)
	}, 3000)
});