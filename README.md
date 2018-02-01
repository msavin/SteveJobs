<img align="right" width="220" src="https://github.com/msavin/stevejobs/blob/master/ICON.png?raw=true" />

# Steve Jobs

### The Simple Jobs Queue That Just Works

Run scheduled tasks with Steve Jobs, the simple jobs queue made just for Meteor. With tight MongoDB integration and fibers-based timing functions, this package is quick, reliable and effortless to use. 

 - Jobs run on one server at a time
 - Jobs run predictably and consecutively
 - Jobs are logged with their outcomes
 - Failed jobs are retried on server restart
 - No third party dependencies

**The new 2.0 runs well but needs to be tested for bugs.** It can run hundreds of jobs in seconds with minimal CPU impact, making it a reasonable choice for many applications. To get started, check out the Quick Start below, take a look at the <a href="https://github.com/msavin/SteveJobs/wiki">**documentation**</a>, and/or try the <a href="http://jobsqueue.herokuapp.com">**live demo**</a>.

## NEW: In-App Development Tool

<img src="https://github.com/msavin/SteveJobs...meteor.schedule.background.tasks.jobs.queue/blob/master/GUI.png?raw=true">

After installing the Steve Jobs package, run the install command below and press Control + J in your app. 

```
meteor add msavin:sjobs-ui-blaze
```

## Quick Start

First, install the package, and import if necessary:

```bash
meteor add msavin:sjobs
```
```javascript
import { Jobs } from 'meteor/msavin:sjobs';
```

Then, write your background jobs like you would write your methods: 

```javascript
Jobs.register({
    "sendReminder": function (to, message) {
        var call = HTTP.put("http://www.mocky.io/v2/5a58d79c2d00006a29d2e66a/?mocky-delay=2000ms", {
            to: to,
            message: message
        })

        if (call.statusCode === 200) {
            this.success(call);
        } else {
            this.failure(call);
        }
    }
});
```

Finally, schedule a background job like you would call a method: 

```javascript
Jobs.run("sendReminder", "tcook@apple.com", "Don't forget about the launch!");
```

One more thing: the function above will schedule the job to run on the moment that the function was called. However, you can delay it by passing in a special <a href="https://github.com/msavin/SteveJobs-meteor-jobs-queue/wiki#configuration-options">**configuration object**</a> at the end:

```javascript
Jobs.run("sendReminder", "jony@apple.com", "The future is here!", {
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

The configuration object supports `date`, `in`, `on`, `priority`, and `state`, all of which are completely optional.

## More Information

- [**Primary Features**](https://github.com/msavin/SteveJobs-meteor-jobs-queue/wiki)<br>Learn how to use the three R's
- [**Secondary Features**]()<br>Learn how to handle edge cases
- [**How It Works**](https://github.com/msavin/SteveJobs-meteor-jobs-queue/wiki/How-It-Works)<br>Learn about the possibilities and limitations

[**Brought to you by Meteor Candy**](https://www.meteorcandy.com/?ref=sjgh)
