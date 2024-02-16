const checkForConfig = function (input) {
	let result = false;
	const lastArgument = input[input.length - 1];
	const keywords = ["in", "on", "priority", "date", "data", "callback", "singular", "unique", "remote"];

	if (typeof lastArgument === "object") {
		keywords.forEach(function (keyword) {
			if (lastArgument[keyword]) {
				result = true;
			}
		});
	}

	return result;
}

const processJobArguments = function (argList) {
	const output = {};
	const args = Array.prototype.slice.call(argList);

	output.name = function () {
		const name = args.shift();
		return name;
	}();

	output.config = function () {
		if (checkForConfig(args)) {
			const config = args.pop();
			return config;
		} else {
			return {};
		}
	}();

	output.callback = function () {
		const lastArgument = args[args.length - 1];

		if (typeof lastArgument === "function") {
			return lastArgument;
		}
	}();

	output.arguments = function () {
		return args;
	}();

	return output;
}

export { processJobArguments }