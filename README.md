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
Jobs.timer = 1000
```

## Pending Work

 - Make it work
 - Add "you're fired" message when a job fails 
 - Ensure this only runs on one server to prevent jobs from running twice
 - Consider repeating jobs for v1 