var logAsString = function (message) {
	console.log("Jobs: " + message);
}

var logAsArray = function (messages) {
	messages.forEach(function (message) {
		console.log("Jobs: " + message);
	});
}

var logger = function (messages) {
	if (typeof messages === "string") {
		logAsString(messages);
	} else if (typeof messages === "object") {
		logAsArray(messages);
	}

	console.log("----")
}

export { logger }