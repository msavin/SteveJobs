import { Utilities } from "../"
import { logger } from "../logger"

getJob = function (input, filter, verify) {
	var jobDoc;

	// figure out the input and deal with accordingly
	if (typeof input === "object" && input._id) {
		jobDoc = input;
	} else if (typeof input === "string") {
		jobDoc = Utilities.collection.findOne(input)
	}

	// verify the job through the database
	if (typeof jobDoc === "object" && verify) {
		jobDoc = Utilities.collection.findOne(jobDoc._id);
	}

	// if its not an object 
	if (typeof jobDoc !== "object") {
		logger(["Job may not exist / unable to retrieve: ", input]);
		return;
	}
	
	// run through the filter

	/*	
		sampleFilter = {
			allow: [""],
			message: String
		}

		This could be done in the database, but: 
		 - its probably faster to query with just _id
		 - we might be passing into a cached document into this function
	*/

	if (filter && filter.allow && filter.allow.indexOf(jobDoc.state) === -1) {
		if (!filter.message) {
			filter.message = "Error retrieving job. Error not specified.";
		}

		logger([filter.message, input])
		return;
	}

	return jobDoc;
}

export { getJob }