# Steve Jobs Package - Documentation (Draft)

## Multiple Queues with Consecutive Job Execution

Every time you register a new job using `Jobs.register`, the package will start a new "runner" that will check for new jobs every 5 seconds by polling the database.

When it finds a job to run, it will run it. After it runs the job, it will check if there is another jobs to run. If so, it will repeat the process, and if not, it will go back to polling the database. 

The rate at which the package polls the database can be configured:

```javascript
Jobs.configure({
    timer: 5 * 1000
})
```

Even though jobs run one at a time, queues run simultaneously.

## Runs on One Server At a Time

This package aims for reliability. To avoid potential screw-ups with MongoDB, the package will claim one server and run from there. If that server stops running, another server will take over.

Whenever a servers starts up, the `JobsControl` function will give that server an id. Then, `JobsRunner` will check if the server with that id is the active server. If it is, it will proceed to run the job. If it is not, it will keep polling to see if anything has changed.

Whenever a server is active, it will let other servers know with a timestamp. If that timestamp becomes "old", the first server to spot it will take over the queue.

By default, a server can "slack off" for up to 5 minutes before another server will pick up the work. This can be configured to your preference: 

```javascript
Jobs.configure({
    activityDelay: 5 * 60 * 1000
})
```

## Development Mode

As explained in the former section, a server has a certain amount of time to signal that its working, otherwise, another server will take over the work. However, this is impractical in development mode because you are running one server and the wait can slow you down. Thus, the package will check if you are in development mode, and if you are, it will mark that as the active server. This should not make any difference so long as not using your production database with your local server.

[TODO] If you are using a production database, you can disable the package in development mode.

```javascript
Jobs.configure({
    productionOnly: true
})
```

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

