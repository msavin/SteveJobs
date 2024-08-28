JobsTests4 = function () {

    // 0 - Clear the collection
    console.log("--- 0 ---")
    var clear = Jobs.clear("*")
    console.log(clear)

    // 1 - Register a Job
    console.log("--- 1 ---")
    Jobs.register({
        "sendReminder": function (email, message) {
            console.log("Sending reminder to " + email + " with message: " + message);
            this.success();
        },
        "simpleJob": function () {
            console.log("Running simple job with no arguments.");
            this.success();
        }
    })

    // 2 - Schedule a job with valid config
    console.log("--- 2 ---")
    try {
        var jobId1 = Jobs.run("sendReminder", "jony@apple.com", "The future is here!", {
            in: {
                days: 3
            },
            priority: 999,
            singular: true,
            callback: function () {
                console.log("Callback executed successfully for jobId1");
            }
        })
        console.log("JobId1 created successfully:", jobId1._id)
    } catch (e) {
        console.error("Error scheduling job with valid config:", e.message);
    }

    // 3 - Schedule a job with only the job name (no config or additional arguments)
    console.log("--- 3 ---")
    try {
        var jobId2 = Jobs.run("simpleJob");
        console.log("JobId2 created successfully:", jobId2._id)
    } catch (e) {
        console.error("Error scheduling simple job:", e.message);
    }

    // 4 - Schedule a job with invalid config (typo in 'priority')
    console.log("--- 4 ---")
    try {
        var jobId3 = Jobs.run("sendReminder", "jony@apple.com", "Hello again!", {
            in: {
                days: 1
            },
            prioirty: 1000,  // Intentional typo: should be 'priority'
            singular: true,
            callback: function () {
                console.log("This callback should not be executed for jobId3");
            }
        })
        console.error("JobId3 should not be created due to invalid config.");
    } catch (e) {
        console.log("Caught expected error for invalid config:", e.message);
    }

    // 5 - Schedule a job with an unsupported config key
    console.log("--- 5 ---")
    try {
        var jobId4 = Jobs.run("sendReminder", "jony@apple.com", "Reminder!", {
            in: {
                hours: 2
            },
            singular: true,
            unsupportedKey: "this should fail" // Unsupported key
        })
        console.error("JobId4 should not be created due to unsupported config key.");
    } catch (e) {
        console.log("Caught expected error for unsupported config key:", e.message);
    }

    // 6 - Log whatever is in the collection
    console.log("--- 6 ---")
    var allJobDocs = JobsInternal.Utilities.collection.find().fetch();
    console.log(allJobDocs);

    // 7 - Cancel the successfully created job (jobId1)
    console.log("--- 7 ---")
    if (jobId1 && jobId1._id) {
        var cancel = Jobs.cancel(jobId1._id);
        console.log("Cancelled jobId1:", cancel);

        // 8 - Verify the job was cancelled
        var jobDoc = Jobs.get(jobId1._id);
        console.log("--- 8 ---")
        console.log("Job doc after cancel:")
        console.log(jobDoc)

        if (jobDoc.state === "cancelled") {
            console.log("Job was successfully cancelled")
        } else {
            console.log("Job cancel failed")
        }
    } else {
        console.error("jobId1 was not created successfully, skipping cancel test.");
    }

    // 9 - Try to cancel a job that was created without any config or arguments (jobId2)
    console.log("--- 9 ---")
    if (jobId2 && jobId2._id) {
        var cancel2 = Jobs.cancel(jobId2._id);
        console.log("Cancelled jobId2:", cancel2);

        // 10 - Verify the job was cancelled
        var jobDoc2 = Jobs.get(jobId2._id);
        console.log("--- 10 ---")
        console.log("Job doc after cancel:")
        console.log(jobDoc2)

        if (jobDoc2.state === "cancelled") {
            console.log("Job was successfully cancelled")
        } else {
            console.log("Job cancel failed")
        }
    } else {
        console.error("jobId2 was not created successfully, skipping cancel test.");
    }
}