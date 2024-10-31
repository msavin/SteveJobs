<img align="right" width="220" src="https://github.com/msavin/stevejobs/blob/master/ICON.png?raw=true" />

# Steve Jobs

### The Simple Jobs Queue That Just Works

Run scheduled tasks with Steve Jobs, the simple jobs queue made just for Meteor. With tight MongoDB integration and fiber-independent async timing functions, this package is quick, reliable, and effortless to use.

- Jobs run on one server at a time
- Jobs run predictably and consecutively
- Jobs, their history, and returned data are stored in MongoDB
- Failed jobs are retried on server restart
- No third-party dependencies
- Fully async/await compatible for Meteor 3.0

**The new 5.0 introduces async/await support to work seamlessly with Meteor 3.0+.!** It can run hundreds of jobs in seconds with minimal CPU impact, making it a reasonable choice for many applications. To get started, check out the <a href="https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md">**documentation**</a> and the <a href="#quick-start">**quick start**</a> below.

Huge thanks to [haryadel](https://github.com/harryadel) and [StorytellerCZ)(https://github.com/StorytellerCZ) for the migration to Meteor 3.0!

## Developer Friendly GUI and API

<img src="https://github.com/msavin/SteveJobs...meteor.schedule.background.tasks.jobs.queue/blob/master/GUI.png?raw=true">

In addition to a simple API, the Steve Jobs package offers an in-app development tool. After installing the main package, run the package command below and press Control + J in your app to open it.

```
meteor add msavin:sjobs-ui-blaze
```

Note: this package may be a little bit flakey, and might not work if `audit-argument-checks` is present. Unfortunately, I had lost the source code, and will probably rebuild the package once there is a good reason to do so.

## Quick Start

First, install the package, and import if necessary:

```bash
meteor add msavin:sjobs
```

```javascript
import { Jobs } from 'meteor/msavin:sjobs'
```

Then, write your background jobs like you would write your methods: 

```javascript
await Jobs.register({
    "sendReminder": async function (to, message) {
        const instance = this;

        try {
            const call = await HTTP.callAsync('PUT', "http://www.magic.com/email/send", {
                data: {
                    to: to,
                    message: message,
                    subject: "You've Got Mail!"
                }
            });

            // Check if response is not 200
            if (call.statusCode !== 200) {
                await instance.reschedule({
                    in: {
                        minutes: 5
                    }
                });
            } else {
                // Return response data if successful
                return call.data;
            }

        } catch (e) {
            // Handle error (e.g., network issue)
            await instance.reschedule({
                in: {
                    minutes: 5
                }
            });
            console.error("Failed to send email. Rescheduling job:", e);
        }
    }
});
```

Finally, schedule a background job like you would call a method: 

```javascript
await Jobs.run("sendReminder", "jony@apple.com", "The future is here!");
```

One more thing: the function above will schedule the job to run on the moment that the function was called, however, you can delay it by passing in a special <a href="https://github.com/msavin/SteveJobs-meteor-jobs-queue/wiki#configuration-options">**configuration object**</a> at the end:

```javascript
await Jobs.run("sendReminder", "jony@apple.com", "The future is here!", {
    in: {
        days: 3,
    },
    on: {
        hour: 9,
        minute: 42
    },
    priority: 9999999999
});
```

The configuration object supports `date`, `in`, `on`, `priority`, `singular`, `unique`, and `data`, all of which are completely optional. For more information, see the `Jobs.run` <a href="https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobsrun">documentation</a>.

## Repeating Jobs

Compared to a CRON Job, the Steve Jobs package gives you much more control over how and when the job runs. To get started, you just need to create a job that replicates itself.

```javascript
await Jobs.register({
    "syncData": async function () {
        const instance = this;
        const call = await HTTP.putAsync("http://www.magic.com/syncData");

        if (call.statusCode === 200) {
            await instance.replicate({
                in: {
                    hours: 1
                }
            });

            // to save storage, you can remove the document
            await instance.remove();
        } else {
            await instance.reschedule({
                in: {
                    minutes: 5
                }
            });
        }
    }
});
```

Then, you need to "kickstart" the queue by creating the first job to run. By using the singular flag, you can ensure that Meteor will only create the job if there is no pending or failed instance of it.

```javascript
Meteor.startup(async function () {
    await Jobs.run("syncData", {
        singular: true
    })    
})
```

## Documentation

`Jobs.register` and `Jobs.run` are all you need to get started, but that's only the beginning of what the package can do. To explore the rest of the functionality, jump into the documentation:
- [Jobs.configure](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobsconfigure)
- [Jobs.register](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobsregister)
- [Jobs.run](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobsrun)
- [Jobs.execute](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobsexecute)
- [Jobs.reschedule](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobsreschedule)
- [Jobs.replicate](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobsreplicate)
- [Jobs.start](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobsstart)
- [Jobs.stop](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobsstop)
- [Jobs.get](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobsget)
- [Jobs.cancel](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobscancel)
- [Jobs.clear](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobsclear)
- [Jobs.remove](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobsremove)
- [Jobs.collection](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/DOCUMENTATION.md#jobscollection)

------

Steve Jobs is an MIT-licensed project, brought to you by [**Meteor Candy**](https://www.meteorcandy.com/?ref=sjgh).
