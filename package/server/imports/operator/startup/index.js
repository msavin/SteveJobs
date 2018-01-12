import { Meteor } from 'meteor/meteor'
import { Utilities } from '../../utilities/'
import { manager } from '../manager'

// 1. Wait 5 seconds for all the code to initialize
// 2. Start Jobs is required

Meteor.startup(function () {
	Meteor.setTimeout(function () {
		if (Utilities.config.autoStart) {
			Meteor.setTimeout(function () {
				manager.start();
				Utilities.config.started = true;
			}, Utilities.config.startupDelay);
		}
	}, 5000)
});