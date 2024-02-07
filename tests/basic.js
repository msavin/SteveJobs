import { Jobs } from 'meteor/msavin:sjobs';

/* 
	Tests the following:
	 - Jobs.register 
	 - Jobs.run 
	 - Jobs.get
	 - Jobs.cancel
	 - Jova.
*/

Tinytest.addAsync("Basic", async function (test) {
	// O - Clear the collection

	console.log("--- 0 ---")
	var clear = await Jobs.clear("*")
	test.equal(clear, 1);

	// 1 - Register the Job

	Jobs.register({
		"sayHi": function (name) {
			console.log("Hi " + name);
			this.success();
		}
	})

	// 2 - Schedule a job
	console.log("--- 2 ---")
	var jobId = await Jobs.run("sayHi", "Steve", {
		in: {
			years: 1
		},
		priority: 1000,
		callback: function () {
			console.log("Callback arguments from Jobs.run:");
			console.log(arguments);
		}
	})
	jobId = jobId._id

	// 3 - Check the due date

	var jobDoc = await Jobs.get(jobId);
	var date = new Date();
	var targetYear = date.getYear() + 1 

	console.log("--- 3 ---")
	console.log("Job doc after creation:")
	console.log(jobDoc);

	test.equal(jobDoc.due.getYear(), targetYear);

	// 4 - Cancel the job 

	var cancel = await Jobs.cancel(jobId);
	test.equal(cancel, 1)
	
	// 5 - Check the job was canceled

	var jobDoc = await Jobs.get(jobId);

	console.log("--- 5 ---")
	console.log("Job doc after cancel:")
	console.log(jobDoc)

	test.equal(jobDoc.state, "cancelled");

	// 6 - Log whatever is in the collection

	console.log("--- 6 ---")
	var allJobDocs = await JobsInternal.Utilities.collection.find().fetchAsync();
	console.log(allJobDocs);
});
