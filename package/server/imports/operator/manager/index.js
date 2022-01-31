import { queue } from "../queue"
import { Utilities } from "../../utilities/"

let debugMode = true;

const manager = {}

manager.queues = {}

manager.add = function (name) {
	if (debugMode) console.log(`Jobs: manager.add(${name})`)
	
	const state = Utilities.autoRetry ? "failure" : "pending";
	manager.queues[name] = new queue(name, state)
}

manager.start = function (name) {
	if (debugMode) console.log(`Jobs: manager.start(${name})`)
	
	const action = (queue) => manager.queues[queue].start()

	if (typeof name === "string") {
		action(name);
	} else if (Array.isArray(name)) { 
		name.forEach(item => action(item))
	} else {
		Object.keys(manager.queues).forEach(item => action(item))
	}
}

manager.stop = function (name) {
	if (debugMode) console.log(`Jobs: manager.stop(${name})`)
	
	const action = (queue) => manager.queues[queue].stop()

	if (typeof name === "string") {
		action(name);
	} else if (typeof name === "object") { 
		name.forEach(item => action(item))
	} else {
		Object.keys(manager.queues).forEach(item => action(item))
	}
}

manager.isAvailable = function (name) {
	if (debugMode) console.log(`Jobs: manager.isAvailable(${name})`)

	return manager.queues[name].available;
}

export { manager, start, stop }