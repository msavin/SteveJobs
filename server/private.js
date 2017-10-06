Jobs = {};

Jobs.internal = {};

Jobs.internal.collection = new Mongo.Collection("simpleJobs");

Jobs.internal.registry = {};

Jobs.internal.run = function (doc) {
	// Goals: 
	// 1- Execute the job
	// 2- Update the document in database
	// 3- Capture the result (if any)

	if (typeof Jobs.internal.registry[doc.name] === "function") {
		// should probably switch to
		// pending: true/false
		// ranSuccessfully: true/false 
		try () {
			var jobResult = Jobs.internal.registry[doc.name](doc.parameters);

			var jobUpdate = Jobs.internal.collection.update(doc._id, $set: {
				state: "successful",
				result: jobResult
			})

			return jobResult;
		} catch (e) {
			var jobUpdate = Jobs.internal.collection.update(doc._id, $set: {
				state: "failed"
			});

			if (jobUpdate) {
				console.log("Jobs: Job failed to run: " + doc.name)
			}
		}
	} else {
		console.log("Jobs: Job not found in registry: " + doc.name);
	}
}
