import { Random } from "meteor/random"

var config = {
	autoStart: true,
	autoPurge: true,
	autoRetry: true,
	started: false,
	interval: 3000,
	startupDelay: 1 * 1000,
	maxWait: 5 * 60 * 1000,
	disableDevelopmentMode: false,
	remoteCollection: undefined,
	serverId: undefined,
	gracePeriod: 10
}

config.getDate = function () {
	var newDate = new Date();
	return newDate;
}

config.setServerId = function () {
	return Random.id();
}

config.getServerId = function (resetId) {
	if (!config.serverId || resetId) {
		config.serverId = config.setServerId()
	}

	return config.serverId;
}

config.log = function (messages) {	
	var logAsString = function (item) {
		console.log("Jobs: " + item);
	}

	console.log("");
	console.log("****");

	if (typeof messages === "string") {
		logAsString(messages);
	} else if (typeof messages === "object") {
		messages.forEach(function (item) {
			logAsString(item)
		});
	}

	console.log("****");
}


export { config }