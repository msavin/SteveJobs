import { Meteor } from "meteor/meteor"
import { Utilities } from "../utilities/"
import { Operator } from "../operator/"

// 1. Wait 5 seconds for all the code to initialize
// 2. Start Jobs if autoStart is enabled

Meteor.startup(function () {
	Meteor.setTimeout(function () {
		if (Utilities.config.autoStart) {
			Meteor.setTimeout(function () {
				Operator.start();
				Utilities.config.started = true;
			}, Utilities.config.startupDelay);
		}
	}, 5000)
});