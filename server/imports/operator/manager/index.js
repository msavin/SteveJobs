import { queue } from "../queue"
import { Utilities } from "../../utilities/"

let debugMode = false;

const manager = {}

manager.queues = {}

manager.add = function (name) {
	if (debugMode) console.log(`Jobs: manager.add(${name})`)
	
	const state = Utilities.autoRetry ? "failure" : "pending";
	manager.queues[name] = new queue(name, state)
}

manager.start = async function (name) {
	if (debugMode) console.log(`Jobs: manager.start(${name})`);
	const action = (queue) => manager.queues[queue].start();

	if (typeof name === "string") {
		await action(name);
	} else if (Array.isArray(name)) {
		await Promise.all(name.map(item => action(item)));
	} else {
		await Promise.all(Object.keys(manager.queues).map(item => action(item)));
	}
}
manager.stop = async function (name) {
	if (debugMode) console.log(`Jobs: manager.stop(${name})`);
	const action = (queue) => manager.queues[queue].stop();

	if (typeof name === "string") {
		await action(name);
	} else if (Array.isArray(name)) {
		await Promise.all(name.map(item => action(item)));
	} else {
		await Promise.all(Object.keys(manager.queues).map(item => action(item)));
	}
}

manager.isAvailable = function (name) {
	if (debugMode) console.log(`Jobs: manager.isAvailable(${name})`)

	return manager.queues[name].available;
}

export { manager }