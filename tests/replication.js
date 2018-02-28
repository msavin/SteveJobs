/* 
	Tests the following:
	 - Jobs.register
	 	- this.replicate
	 - Jobs.run
	 - Jobs.execute
*/

JobsTests2 = function () {

	// O - Clear the collection

	console.log("--- 0 ---")
	var clear = Jobs.clear("*")
	console.log(clear)
	
	// 1 - Register the Job

	Jobs.register({
		"timeThing": function () {
			doc = this.document;

			console.log("The current time is");
			console.log(new Date());

			console.log("The jobs due time is");
			console.log(doc.due);

			console.log("");

			this.replicate({
				in: {
					seconds: 5
				}
			})

			this.success();
		}
	})

	// 2 - Schedule a job

	var jobId = Jobs.run("timeThing", {
		in: {
			years: 1
		}
	})

	jobId = jobId._id

	// 3 - Execute the job early

	Jobs.execute(jobId, function () {
		console.log("Callback from Jobs.execute. Arguments are:");
		console.log(arguments);
	})
}