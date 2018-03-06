import { logger } from "../logger"

var number = function (input, note) {
	if (typeof input === "undefined") {
		return 0;
	}

	if (typeof input === "function") {
		input = input();
	}

	if (typeof input === "string") {
		input = Number(input);
	}

	if (isNaN(input)) {
		input = 0;
		logger(["Invalid input for " + note || "number", "therefore, it was set to 0"]);
	}

	return input;
}

export { number }