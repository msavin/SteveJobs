var checkConfig = function (input) {
	var result = false,
		lastArgument = input[input.length - 1],
		keywords = ["in", "on", "priority", "date", "data", "callback"];

	if (typeof lastArgument === "object") {
		keywords.forEach(function (keyword) {
			if (lastArgument[keyword]) {
				result = true;
			}
		});
	}

	return result;
}

var processArguments = function (args) {
	var output = {},
		args = Array.prototype.slice.call(args);

	output.name = function () {
		var name = args.shift();
		return name;
	}()

	output.config = function () {
		if (checkConfig(args)) {
			var config = args.pop();
			return config;
		} else {
			return {};
		}
	}()

	output.arguments = function () {
		return args;
	}()

	return output;
}

export { processArguments }