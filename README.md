<img align="right" width="220" src="https://github.com/msavin/stevejobs/blob/master/ICON.png?raw=true" />

# Steve Jobs

### The Simple Jobs Queue That Just Works

Run scheduled tasks with Steve Jobs, the simple jobs queue made just for Meteor. With tight MongoDB integration and fibers-based timing functions, this package is reliable, quick and effortless. 

 - Runs on one server at a time
 - Runs predictably and consecutively
 - Logs all the jobs and their outcomes
 - Retries failed jobs on restart
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
    sendReminder: function (to, content) {
        Email.send({
            to: to,
            from: "no-reply@jobs.com",
            subject: "Your Reminder",
            content: content,
        })
    }
});
```

Finally, schedule a background job like you would call a method: 

```javascript
Jobs.run("sendReminder", "tcook@apple.com", "Don't forget about the launch!");
```

One more thing: the function above will schedule the job to run on the moment that the function was called. However, you can delay it by passing in a special <a href="https://github.com/msavin/SteveJobs-meteor-jobs-queue/wiki#configuration-options">**configuration object**</a> at the end. 

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

## More Information

- [**Main Features**](https://github.com/msavin/SteveJobs-meteor-jobs-queue/wiki)<br>Learn how to use the three R's: register, run and repeat
- [**Package Features**]()<br>Learn how to handle edge cases
- [**How It Works**](https://github.com/msavin/SteveJobs-meteor-jobs-queue/wiki/How-It-Works)<br>Learn the features and limitations
- [**Roadmap**](https://github.com/msavin/SteveJobs-meteor-jobs-queue/projects/1)<br>See what's coming and get involved
- [**Brought to you by Meteor Candy**](https://www.meteorcandy.com/?ref=sjgh)<br>Add an admin panel to your Meteor app in 5 minutes