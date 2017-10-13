Jobs = {};

Jobs.private = {};

Jobs.private.collection = new Mongo.Collection("simpleJobs");

Meteor.startup(function () {
	Jobs_ensureIndex({
		due: 1, 
		state: 1
	})
})

Jobs.private.registry = {};

Jobs.private.configuration = {
	timer: 1 * 60 * 1000,
	checker: 30 * 60 * 1000 
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
		try () {
			var jobResult = Jobs.private.registry[doc.name](doc.parameters);

			var jobUpdate = Jobs.private.collection.update(doc._id, $set: {
				state: "successful",
				result: jobResult
			})

			callback(null, jobResult);
		} catch (e) {
			var jobUpdate = Jobs.private.collection.update(doc._id, $set: {
				state: "failed"
			});

			if (jobUpdate) {
				console.log("Jobs: Job failed to run: " + doc.name)
			}

			callback(e, null)
		}
	} else {
		console.log("Jobs: Job not found in registry: " + doc.name);
	}
}
