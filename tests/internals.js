import { Jobs } from 'meteor/msavin:sjobs';

/* 
	Tests the following:
	 - Jobs.register
	 	- this.reschedule
	 	- this.remove
	 	- this.set
	 	- this.get
	 	
*/

Tinytest.addAsync("Internals", async function (test) {
	// O - Clear the collection

	console.log("--- 0 ---")
	var clear = await Jobs.clear("*")
	
	// 1 - Register the Job

	console.log("--- 1 ---")
	await Jobs.register({
		"statefulJob": async function () {
			self = this;

			let count = await self.get("count");
			console.log("I am: " + count)

			if (count < 5) {
				count = count + 1;
				console.log("current is:" + count)
				await self.set("count", count)
				
				test.equal(self.document.data.count, count)
				
				await self.reschedule({
					in: {
						seconds: 5
					}
				})
			} else {
				test.equal(self.document.data.count, 5);
				await self.remove()
			}

			console.log(self.document)
		}
	})

	// 2 - Schedule a job
	console.log("--- 2 ---")
	var jobId = await Jobs.run("statefulJob", {
		data: {
			count: 1
		}
	})
	console.log("Job doc after run:")
	console.log(jobId)

});