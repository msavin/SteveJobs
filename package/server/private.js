Jobs = {};

Jobs.private = {};

Jobs.private.collection = new Mongo.Collection("simpleJobs");

Meteor.startup(function () {
	Jobs.private.collection._ensureIndex({
		due: 1, 
		state: 1
	})
})

Jobs.private.registry = {};

Jobs.private.configuration = {
	timer: 5 * 1000,
	activityGap: 5 * 60 * 1000,
	activityDelay: 5 * 1000
}

Jobs.private.run = function (doc, callback) {
	// Goals: 
	// 1- Execute the job
	// 2- Update the document in database
	// 3- Capture the result (if any)

	if (typeof Jobs.private.registry[doc.name] === "function") {
		// should probably switch to
		// pending: true/false
		// ranSuccessfully: true/false 
		try {
			var jobResult = Jobs.private.registry[doc.name](doc.parameters);

			var jobUpdate = Jobs.private.collection.update(doc._id, {
				$set: {
					state: "successful",
					lastRun: new Date(),
					completed: new Date(),
					result: jobResult
				}
			})

			if (typeof callback === "function") {
				callback(null, jobResult);
			} else if (typeof callback !== "undefined") {
				console.log("Jobs: Invalid callback, but job still ran");
				console.log("----")
			}
		} catch (e) {
			var jobUpdate = Jobs.private.collection.update(doc._id, {
				$set: {
					lastRun: new Date(),
					state: "failed"
				}
			});

			if (jobUpdate) {
				console.log("Jobs: Job failed to run: " + doc.name)
			}

			if (typeof callback === "function") {
				callback(e, null)
			} else if (typeof callback !== "undefined") {
				console.log("Jobs: Invalid callback, but job still ran");
				console.log("----")
			}
		}
	} else {
		console.log("Jobs: Job not found in registry: " + doc.name);
	}
}


// Jobs.private.date = {};

/* Supported fields:
	- second
	- minute
	- hour
	- day
	- month
	- year
// */

// Jobs.private.date.fields = []

// Jobs.private.date.on = function (on) {
// 	current = new Date();
// 	return date;
// }

// Jobs.private.date.in = function (in) {

// }