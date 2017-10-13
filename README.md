<img align="right" width="220" src="https://github.com/msavin/stevejobs/blob/master/avatar.png?raw=true" />

# Steve Jobs

## The simple jobs queue that just works. 

**IN DEVELOPMENT.** Steve Jobs makes it really easy to run scheduled tasks. It's specially designed to work with Meteor by leveraging MongoDB and the fibers-based timeout function for effortless setup and ease of use.

## How to Use

First, install the package:

	meteor add msavin:stevejobs

Second, define your background jobs: 

```javascript
Jobs.register({
    sendReminderEmail: function (parameters) {
        Email.send({
            to: parameters.to,
            from: "no-reply@jobs.com",
            subject: "Your Reminder",
            content: parameters.content,
        })
    },
    somethingElse: function (parameters) {
        Collection.insert({
            date: new Date(),
            data: parameters
        });
    }
})
```

Finally, schedule a job by specifying how soon to run it:

```javascript
Jobs.add({
    name: sendReminderEmail,
    parameters: {
        to: "john@smith.com",
        message: "hi this is your reminder"
    },
    in: {
        days: 1,
        hours: 3,
        minutes: 14
    }
})
```

Or when to run it: 

```javascript
Jobs.add({
    name: sendReminderEmail,
    parameters: {
        to: "john@smith.com",
        message: "hi this is your reminder"
    },
    on: {
        month: 0,
        day: 1,
        hour: 23,
        year: 2017
    }
})

```

## Additional Information

The package will run one job at a time until there are no more jobs to run. After that, it will check for new jobs every 30 seconds by quering the database. However, you could change the frequency to your preference with a simple setting: 

```javascript
Jobs.configure({
    timer: 1000,
    checker: 30000
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

// Remove a job
Jobs.remove(jobId);

// Run a job ahead of time, and provide optional callback
Jobs.run(jobId, function (e,r) {
    if (e) {
        console.log("You're fired!")
    }
});

// Access the Jobs collection directly
Jobs.collection.find().fetch();
```

## How It Works

For more information on how it works, including how jobs run, how the timing works, what happens when a job fails, and so on, check out "<a href="HOWITWORKS.md">How It Works</a>."
