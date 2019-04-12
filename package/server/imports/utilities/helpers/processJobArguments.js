var checkForConfig = function (input) {
	var result = false,
		lastArgument = input[input.length - 1],
		keywords = ["in", "on", "priority", "date", "data", "callback", "singular", "unique", "remote"];

	if (typeof lastArgument === "object") {
		keywords.forEach(function (keyword) {
			if (lastArgument[keyword]) {
				result = true;
			}
		});
	}

	return result;
}

var processJobArguments = function (args) {
	var output = {},
		args = Array.prototype.slice.call(args);

	output.name = function () {
		var name = args.shift();
		return name;
	}();

	output.config = function () {
		if (checkForConfig(args)) {
			var config = args.pop();
			return config;
		} else {
			return {};
		}
	}();

	output.callback = function () {
		var lastArgument = args[args.length - 1];

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