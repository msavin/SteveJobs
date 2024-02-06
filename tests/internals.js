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
	console.log(clear)
	
	// 1 - Register the Job

	Jobs.register({
		"statefulJob": async function () {
			self = this;

			var count = self.get("count");
			console.log(self)
			console.log("I am: " + count)
			if (count < 5) {

				count = count + 1;
				console.log("current is:" + count)
				self.set("count", count)

				self.reschedule({
					in: {
						seconds: 5
					}
				})
			} else {
				await self.remove()
			}

			console.log(self.document)
		}
	})

	// 2 - Schedule a job

	var jobId = Jobs.run("statefulJob", {
		data: {
			count: 1
		}
	})

});