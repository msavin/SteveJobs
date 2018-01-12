import { queue } from "../queue"

var manager = {}

manager.queues = {}

manager.add = function (name) {
	manager.queues[name] = new queue(name)
}

manager.start = function (name) {
	var action = function (queue) {
		manager.queues[queue].start()
	}

	if (typeof name === "string") {
		action(name);
	} else if (typeof name === "object") { 
		name.forEach(function (item) {
			action(item);
		});
	} else {
		Object.keys(manager.queues).forEach(function (item) {
			action(item);
		});	
	}
}

manager.stop = function (name) {
	var action = function (queue) {
		manager.queues[queue].stop()
	}

	if (typeof name === "string") {
		action(name);
	} else if (typeof name === "object") { 
		name.forEach(function (item) {
			action(item);
		});
	} else {
		Object.keys(manager.queues).forEach(function (item) {
			action(item);
		});	
	}
}

manager.isAvailable = function (name) {
	return manager.queues[name].available;
}

export { manager, start, stop }