var configIsPresent = function (input) {
	var lastItem = input[input.length - 1],
		lastItemIsConfig = false,
		reservedWords = ["in", "on", "priority", "date", "data", "callback"];

	if (typeof lastItem === "object") {
		reservedWords.forEach(function (word) {
			if (lastItem[word]) {
				lastItemIsConfig = true;
			}
		});
	}

	return lastItemIsConfig;
}

var processInput = function (args) {
	var output = {},
		args = Array.prototype.slice.call(args);

	output.name = function () {
		var name = args.shift();
		return name;
	}()

	output.config = function () {
		if (configIsPresent(args)) {
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

export { processInput }