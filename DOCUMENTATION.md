# Steve Jobs Package - Documentation (Draft)

## Runs One Job At a Time

The Steve Jobs package is quite like Steve Jobs, and quite unlike him at the same time. In favor of ease and simplicity, the package does not aim to execute things on the dot. 

Instead, it checks for new jobs every 5 seconds and runs only one job at a time. Whenever it runs a job, it will then check if there are more jobs pending. If there are not, it will go back to checking every 5 seconds. This can be configured to your preference:

```javascript
Jobs.configure({
    timer: 5 * 1000
})
```

In general, things would probably be off by a couple of seconds or minutes. In some basic tests, Meteor was able to add and execute hundreds of jobs in seconds, so provided you are not expecting a million background tasks to run on the same second, this package should cover your needs.

## Runs on One Server At a Time

This package aims for reliability above everything. To avoid potential screw-ups with MongoDB read/write commands, the package will claim one server and run from there. If that server stops running, another server will take over.

Whenever a server starts up, it will be given a randomly generated id. The server will then check if there is a server processing jobs, and if not, it will use its id and a timestamp to let other servers know that it has taken over. Other servers will automatically check the ping time to ensure it is active. The first server that spots that the timestamp has expired will take over the queue.

By default, a server can "slack off" for up to 5 minutes before another server will pick up the work. This can be configured to your preference: 

```javascript
Jobs.configure({
    activityDelay: 5 * 60 * 1000
})
```

## Development Mode

As explained in the former section, a server has a certain amount of time to signal that its working, otherwise, another server will take over the work. However, this is impractical in development mode because you are running one server and the wait can slow you down. Thus, the package will check if you are in development mode, and if you are, it will mark that as the active server. This should not make any difference so long as not using your production database with your local server.

## Server Startup

Jobs will wait 5 seconds before starting its process. This can be configured to your preference:

```javascript
Jobs.configure({
    startupDelay: 5 * 1000
})
```

## Job States 

Jobs can have four different states:
 - `pending`
 - `failed`
 - `succeeded`
 - `canceled`

Jobs that have failed will be re-tried whenever the a server becomes active (never give up!). It will attempt to run them one at a time until it goes through all of them. That way, if you deploy a fix it will be tried automatically.

After it goes through the failed entries, it will go through the pending jobs. After that, it will poll the database every 5 seconds to see if there is anything new. Jobs that are Pending and/or Failed can be canceled with `Jobs.cancel(jobId)`. 

Jobs that have succeeded or are canceled can be cleared with `Jobs.clear`. The function will automatically clear dormant documents, which are those which have succeeded or have been canceled. However, the function also accepts two arguments. If you can pass in one `true` argument, it will remove failed jobs, and if you pass in `true, true`, it will remove all the jobs.

```javascript
Jobs.clear(true, true)
```

## Fibers-based Timing

This package uses `Meteor.setInterval` and `Meteor.setTimer`. While the idea of timeouts on a server may not sound like a good idea - it may actually be the right approach because the Meteor's timing functions are automatically bound with-in a fiber. 

## MongoDB Indexing

Steve Jobs will create the following collections: 
  - `jobs_config` for configuration data, which mainly revolves around figuring out which server should be running the jobs.
  - `jobs_data` for jobs data, which includes everything a job needs to run. 

The `jobs_data` collection is indexed on the `due` and `state` fields for optimal read performance.

## Timing and Timezones

This package will use the servers time and timezone to base all of its operations, and all time functions are relative to that. This should ensure that jobs run predictably (i.e. ru this job in 30 minutes). If timezone is of importance, you can set it manually in Meteor with the `TZ` environment variable. 

## Server-Side Only

The Jobs is designed to be minimal and works server-side only. However, you could make its data accessible on the client using Method's or Pub/Sub. For example:

```javascript
// client
Jobs = new Mongo.Collection('jobs_data');
Meteor.subscribe("jobs")
```
```javascript
// server
Meteor.publish("jobs", function () {
	return Jobs.collection.find();
})
```

You can also write Method's to make it easy to create your own jobs from the client:

```javascript
// server
Meteor.methods({
	'addJob': function () {
		args = Array.prototype.slice.call(arguments);
		job = Jobs.add.apply(null, args)
		return job;
	}
})
```

```javascript
// client
AddJob = function () {
	args = Array.prototype.slice.call(arguments);
	args.unshift("addJob")
	Meteor.call.apply(null, args);
}
```

Note: these are untested examples, and they are not secure at all


## Future Ideas (Contributions Welcome)

The package completes its goal of helping you run scheduled tasks in a simple and predictable way. However, it doesn't have to stop there. Here are some ideas - feel free to open a ticket about implementing one of them or proposing something new.

 - Create a way to run jobs across multiple servers. One easy way to do this is by playing with the MongoDB document ID's. For example, if the first character is a letter, use server one, if its a letter, use server two. Or, creating a new queue for each job.
 - Create a way for the server to pause jobs if the CPU usage is high. Every little bit helps, right?
 - Create a way to run jobs as a microservice.
 - Create a way to repeat jobs. (Perhaps this should be another package?)
 - Create a way to prioritize certain jobs
 - Add support for hooks
 - Add Jobs.delay() to delaying tasks
 - Add support for setting manual timezones on jobs