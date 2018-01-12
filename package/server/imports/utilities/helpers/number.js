var number = function (input, note) {
	if (typeof input === "undefined") {
		return 0;
	}

	if (typeof input === "function") {
		input = input();
	}

	if (typeof input === "string") {
		input = Number(input);

		if (isNaN(input)) {
			console.log("Jobs: invalid input for " + note || "number");
			return 0
		}
	}

	if (typeof input === "number") {
		return input;
	} else {
		console.log("Jobs: invalid input for " + note || "number");
		return 0;
	}
}

export { number }