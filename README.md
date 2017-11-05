<img align="right" width="220" src="https://github.com/msavin/stevejobs/blob/master/ICON.png?raw=true" />

# Steve Jobs

### The Simple Jobs Queue That Just Works

Run scheduled tasks effortlessly with Steve Jobs, the simple jobs queue made just for Meteor. With tight MongoDB integration and fibers-based timing functions, using this package is quick and effortless.

 - Jobs runs on one server at a time
 - Jobs runs predictably and consecutively
 - Logs all the jobs and their outcomes
 - Retries failed jobs on server restart
 - No third party dependencies

**The package has been production tested and is ready for action.** It can run hundreds of jobs in seconds, with minimal CPU impact, making it a reasonable choice for many applications. To get started, check out the Quick Start below, take a look at the <a href="./https://github.com/msavin/SteveJobs-meteor-jobs-queue/wiki/Primary-Features">**documentation**</a>, and try the <a href="http://jobsqueue.herokuapp.com">**live demo**</a>.

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

One more thing. The function above will schedule the job to run as soon as possible. However, you can delay it by passing in a special configuration object at the end.

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

The supported fields for `in` and `on` are:
 - `millisecond`, `second`, `minute`, `hour`, `day`, `month`, and `year`
 - `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `months`, and `years`

The plural or singular versions of words can be used to your preferences. The date object will be updated in the order that is specified. For example, if you set the job to run `in` 1 year, an `on` year 2037, the year will be 2037. However, if you set the job to run `on` year 2037, and `in` 1 year, the year will be 2038.

Finally, you have the option of settings the priority of the job with the priority key. By default, priority will be set to 0, and you can change it to any number, positive or negative. Jobs will run the jobs with the highest priority first.

## For More Information

For more information about how the package works, how jobs run, how the timing works, job failures, etc, check out the "<a href="https://github.com/msavin/SteveJobs-meteor-jobs-queue/wiki/Primary-Features">documentation</a>."

If you like the design of the package, make sure to check out: 
 - <a href="http://meteor.toys">Meteor Toys</a> - Development Tools
 - <a href="https://www.meteorcandy.com">Meteor Candy</a> - Admin Panel
