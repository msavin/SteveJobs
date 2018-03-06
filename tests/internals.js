/* 
	Tests the following:
	 - Jobs.register
	 	- this.reschedule
	 	- this.remove
	 	- this.set
	 	- this.get
	 	
*/

JobsTests3 = function () {

	// O - Clear the collection

	console.log("--- 0 ---")
	var clear = Jobs.clear("*")
	console.log(clear)
	
	// 1 - Register the Job

	Jobs.register({
		"statefulJob": function () {
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
				self.remove()
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
}