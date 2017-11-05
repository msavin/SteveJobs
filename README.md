<img align="right" width="220" src="https://github.com/msavin/stevejobs/blob/master/ICON.png?raw=true" />

# Steve Jobs

### The Simple Jobs Queue That Just Works

Run scheduled tasks with Steve Jobs, the simple jobs queue made just for Meteor. With tight MongoDB integration and fibers-based timing functions, this package is reliable, quick and effortless.

 - Jobs runs on one server at a time
 - Jobs runs predictably and consecutively
 - Logs all the jobs and their outcomes
 - Retries failed jobs on server restart
 - No third party dependencies

**The package has been production tested and is ready for action.** It can run hundreds of jobs in seconds with minimal CPU impact, making it a reasonable choice for many applications. To get started, check out the Quick Start below, take a look at the <a href="./https://github.com/msavin/SteveJobs-meteor-jobs-queue/wiki/Primary-Features">**documentation**</a>, and/or try the <a href="http://jobsqueue.herokuapp.com">**live demo**</a>.

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
        docId = Collection.insert({
            date: new Date(),
            data: data
        });

        return docId;
    }
});
```

Finally, schedule a background job like you would call a method: 

```javascript
Jobs.run("sendReminderEmail", "john@smith.com", "Don't forget about the launch!");
```

One more thing: the function above will schedule the job to run on the moment that the function was called. However, you can delay it by passing in a special <a href="https://github.com/msavin/SteveJobs-meteor-jobs-queue/wiki#configuration-options">**configuration object**</a> at the end. 

```javascript
Jobs.run("sendReminderEmail", "john@smith.com", "The future is here!", {
    in: {
        days: 1,
        hours: 13
    }, 
    on: {
        minute: 13,
        year: 2037
    },
    priority: 1000
});
```

## More Information

For more information about how the package works, how jobs run, how the timing works, job failures, etc, check out the "<a href="https://github.com/msavin/SteveJobs-meteor-jobs-queue/wiki/">**documentation**</a>."

If you like the design of the package, make sure to check out <a href="https://www.meteorcandy.com">**Meteor Candy**</a>, the fastest and easiest way to add an admin panel to your app.
