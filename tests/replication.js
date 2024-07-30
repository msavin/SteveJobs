import { Jobs } from 'meteor/msavin:sjobs';

/* 
	Tests the following:
	 - Jobs.register
	 	- this.replicate
	 - Jobs.run
	 - Jobs.execute
*/

Tinytest.addAsync("Replication", async function (test) {

	// O - Clear the collection

	console.log("--- 0 ---")
	var clear = await Jobs.clear("*")
	console.log(clear)
	
	// 1 - Register the Job

	await Jobs.register({
		"timeThing": async function () {
			doc = this.document;

			console.log("The current time is");
			console.log(new Date());

			console.log("The jobs due time is");
			console.log(doc.due);

			console.log("");

			await this.replicate({
				in: {
					seconds: 5
				}
			})

			await this.success();
		}
	})

	// 2 - Schedule a job

	var jobId = await Jobs.run("timeThing", {
		in: {
			years: 1
		}
	})

	jobId = jobId._id

	// 3 - Execute the job early

	await Jobs.execute(jobId, function () {
		console.log("Callback from Jobs.execute. Arguments are:");
		console.log(arguments);
	})
})