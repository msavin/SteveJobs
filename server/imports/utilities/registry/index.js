var registry = {};

registry.data = {};

registry.add = function (job, jobs) {
	registry.data[job] = jobs;
}

export { registry }