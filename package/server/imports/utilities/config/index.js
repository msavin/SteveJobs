import { Random } from "meteor/random"

const config = {
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
	return new Date();
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
	const logAsString = (item) => console.log("Jobs: " + item);

	console.log("");
	console.log("****");

	if (Array.isArray(messages)) {
		messages.forEach(item => logAsString(item))
	} else {
		logAsString(messages);
	}

	console.log("****");
}


export { config }