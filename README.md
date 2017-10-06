<img align="right" width="220" src="https://github.com/msavin/stevejobs/blob/master/avatar.png?raw=true" />

# Steve Jobs

## The simple jobs queue that just works. 

**IN DEVELOPMENT.** Steve Jobs makes it really easy to run scheduled tasks. It's designed to work naturally with Meteor by storing data with MongoDB and using the fibers-based `Meteor.setTimeout` function to check for pending jobs.

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
        Collection.insert(parameters)
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
Jobs.timer = 1000;
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

// Run a job ahead of time
Jobs.run(jobId);

// Access the Jobs collection directly
Jobs.internal.collection.find().fetch();
```

## Archiving 

Jobs will automatically archive jobs. There are three types of jobs: failed, successful, and pending. 

## Pending Work

 - Make it work
 - Add "you're fired" message when a job fails 
 - Ensure this only runs on one server to prevent jobs from running twice
 - Consider repeating jobs for v1 
 - Create a way to cache jobs, or clear jobs. Hmm.
 - Set MongoDB indexes

## Future Ideas

 - Create a way to run jobs across multiple servers. One easy way to do this is by playing with the MongoDB document ID's. For example, if the first character is a letter, use server one, if its a letter, use server two.
 - Create a way for the server to pause jobs if the CPU usage is high. Every little bit helps, right?
 - Create a way for a server with lower CPU consumption to take over the jobs queue if possible.
 - Create a way to run jobs as a microservice.