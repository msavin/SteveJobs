import { Utilities } from '../../utilities'

var cancel = function (id, callback) {
	check(id, String)
	
	var job = Utilities.collection.findOne(id);


	if (job) {
		if (job.state === "pending" || job.state === "failed") {
			
			var result = Utilities.collection.update(id, {
				$set: {
					state: "cancelled"
				},
				$push: {
					history: {
						date: new Date(),
						state: "cancelled"
					}
				}
			})

			if (callback) callback(undefined, result);
			return result;
		} else {
			Utilities.logger([
				"Cancel failed for " + id,
				"Job has completed successfully or is already cancelled"
			])
			
			if (callback) callback(true, undefined);

			return false;
		}
	} else {
		Utilities.logger([
			"Cancel failed for " + id,
			"No such job found"
		])

		if (callback) callback(true, undefined);
		return false;
	}
}

export { cancel }