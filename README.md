<img align="right" width="220" src="https://github.com/msavin/stevejobs/blob/master/ICON.png?raw=true" />

# Steve Jobs

### The Simple Jobs Queue That Just Works [IN TESTING]

Run scheduled tasks effortlessly with Steve Jobs, the simple jobs queue made just for Meteor. With tight MongoDB integration and fibers-based timing functions, using this package is quick and effortless.

 - Runs one job at a time
 - Runs on one server at a time
 - Logs all the jobs and their outcomes
 - Retries failed jobs on server restart
 - Designed to perform well on Meteor
 - No third party dependencies

The package has been production tested and is ready for action. It can run hundreds of jobs in seconds, making it a reasonable choice for many applications. To get started, check out the Quick Start below, take a look at the <a href="./DOCUMENTATION.md">documentation</a>, and try the <a href="http://jobsqueue.herokuapp.com">live demo</a>.

## Quick Start

First, install the package:

```bash
meteor add msavin:sjobs
```

Then, write your background jobs like you would write your methods: 

```javascript
Jobs.register({
    sendReminderEmail: function (to, content) {
        Email.send({
            to: to,
            from: "no-reply@jobs.com",
            subject: "Your Reminder",
            content: content,
        })
    },
    insertRecord: function (data) {
        Collection.insert({
            date: new Date(),
            data: data
        });
    }
});
```

Finally, schedule a background job like you would call a method: 

```javascript
Jobs.add("sendReminderEmail", "john@smith.com", "Don't forget about the launch!");
```

The job will be added to the queue to run ASAP. However, you can delay it by passing in a special object at the end: 

```javascript
Jobs.add("sendReminderEmail", "john@smith.com", "The future is here!", {
    in: {
        days: 1,
        hours: 13
    }, 
    on: {
        minute: 13,
        year: 2037
    }
});
```

The supported fields for `in` and `on` are:
 - `millisecond`, `second`, `minute`, `hour`, `day`, `month`, and `year`
 - `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `months`, and `years`

The plural or singular versions of words can be used to your preferences. The date object will be updated in the order that is specified. For example, if you set the job to run `in` 1 year, an `on` year 2037, the year will be 2037. However, if you set the job to run `on` year 2037, and `in` 1 year, the year will be 2038.

## Feature Overview 

The package will run one job at a time until there are no more jobs to run. After that, it will check for new jobs every 5 seconds by querying the database. However, you could change that and more: 

```javascript
Jobs.configure({
    timer: 5 * 1000,                // how often to check for new jobs
    startupDelay: 5 * 1000          // how soon to run after the server has started
    activityDelay: 5 * 60 * 1000,   // how long a server can slack off for before another server takes over
})
```

The package also provides ways for your to interact with your queue.

```javascript
// Run a job ahead of time, and provide optional callback
Jobs.run(jobId, function (e,r) {
    if (e) {
        console.log("You're fired!")
    }
});

// Stop the job queue (for development purposes)
Jobs.stop();

// Start the job queue (for development purposes)
Jobs.start();

// Restart the queue, forcing failed jobs to re-run without restarting servers (for development purposes)
Jobs.restart();

// Get information about a pending job
Jobs.get(jobId);

// Cancel a job 
Jobs.cancel(jobId);

// Clear completed and/or canceled jobs
Jobs.clear()

// Access the Jobs collection directly
Jobs.collection.find();
```

## More Details

For more information about how the package works, how jobs run, how the timing works, job failures, etc, check out the "<a href="DOCUMENTATION.md">documentation</a>."

If you like the design of the package, make sure to check out: 
 - <a href="http://meteor.toys">Meteor Toys</a> - Development Tools
 - <a href="https://www.meteorcandy.com">Meteor Candy</a> - Admin Panel