<img align="right" width="220" src="https://github.com/msavin/stevejobs/blob/master/avatar.png?raw=true" />

# Steve Jobs

### The simple jobs queue that just works. [IN DEVELOPMENT]

Steve Jobs makes it really easy to run scheduled tasks on Meteor. It's specially designed to work with Meteor by leveraging MongoDB collections and fibers-based timer functions for effortless setup and use.
 - Runs one job at a time
 - Runs on one server at a time
 - Logs all jobs and their outcomes
 - Retries failed jobs on server restart
 - Designed for smooth performance on Meteor

## Get Started

First, install the package:

```bash
meteor add msavin:sjobs
```

Second, write your background jobs like you would your methods: 

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

Finally, schedule a job to run like you would run a method: 

```javascript
Jobs.add("sendReminderEmail", "john@smith.com", "Don't forget about the launch!");
```

The job will be added to the queue to run as soon as possible. You can delay it by passing in a special object: 

```javascript
Jobs.add("sendReminderEmail", "john@smith.com", "The future is here!", {
    in: {
        days: 1,
        hours: 13
    }, 
    on: {
        minutes: 13,
        year: 2037
    }
});
```

The supported fields for `in` and `on` are `milliseconds`, `seconds`, `minutes`, `hours`, `day`, `month`, and `year`. 

## Configuration and API

The package will run one job at a time until there are no more jobs to run. After that, it will check for new jobs every 30 seconds by quering the database. However, you could change the frequency to your preference: 

```javascript
Jobs.configure({
    timer: 5 * 1000,                // how often to check for new jobs
    startupDelay: 5 * 1000          // how soon to run after the server has started
    activityDelay: 5 * 60 * 1000, // how long a server can slack off for before another server takes over
})
```

In addition to creating jobs, you can also use:

```javascript
// Stop the job queue - could be handy for development
Jobs.stop();

// Start the job queue - could be handy for development
Jobs.start();

// Get information about a pending job
Jobs.get(jobId);

// Cancel a job but do not remove from database
Jobs.cancel(jobId);

// Run a job ahead of time, and provide optional callback
Jobs.run(jobId, function (e,r) {
    if (e) {
        console.log("You're fired!")
    }
});

// Access the Jobs collection directly
Jobs.collection.find().fetch();

// Clear the logs
Jobs.clear() // pass in `true` to remove failed documents, pass in `true, true` to remove all
```

## More Information

For more information about how the package works, how jobs run, how the timing works, what happens when a job fails, and so on, check out "<a href="HOWITWORKS.md">How It Works</a>."

If you like the design of the package, make sure to check out: 
 - <a href="http://meteor.toys">Meteor Toys</a> - Development Tools
 - <a href="https://www.meteorcandy.com">Meteor Candy</a> - Admin Panel