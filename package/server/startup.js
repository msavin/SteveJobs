/* 
	Since packages load first, we need to add a slight delay to the startup
	in order to let the end-users startupDelay value register
*/

Meteor.startup(function () {
	Meteor.setTimeout(function () {
		Meteor.setTimeout(function () {
			Jobs.start();
		}, Jobs.private.configuration.activityDelay);
	}, 3000)
});
