import { Meteor } from "meteor/meteor"
import { Utilities } from "../utilities/"
import { Operator } from "../operator/"

// 1. Wait 3 seconds for all the code to initialize
// 2. Start Jobs if autoStart is enabled

Meteor.startup(function () {
	Utilities.start();
	Operator.start();
	
	if (Utilities.config.autoStart) {
		Operator.manager.start();
		console.log("=> Started jobs queue")
	} else {
		console.log("=> Steve Jobs: auto start is disabled")
	}
});