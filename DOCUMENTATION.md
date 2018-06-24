# Steve Jobs Documentation [DRAFT]

Steve Jobs is an all inclusive package for scheduling background jobs. It automates everything, so that you can get started with just `Jobs.register` and `Jobs.run`. At the same time, it allows you to configure and override just about any part of its functionality.

 - [Jobs.configure](#jobsconfigure)
 - [Jobs.register](#jobsregister)
 - [Jobs.run](#jobsrun)
 - [Jobs.execute](#jobsexecute)
 - [Jobs.reschedule](#jobsreschedule)
 - [Jobs.replicate](#jobsreplicate)
 - [Jobs.start](#jobsstart)
 - [Jobs.stop](#jobsstop)
 - [Jobs.get](#jobsget)
 - [Jobs.cancel](#jobscancel)
 - [Jobs.clear](#jobsclear)
 - [Jobs.remove](#jobsremove)
 - [Jobs.collection](#jobscollection)

### Jobs.configure

`Jobs.configure` allows you to configure how the package should work. You can figure one option or all of them. All the options are pre-configured in [`./package/server/imports/utilities/config.js`](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/blob/master/package/server/imports/utilities/config/index.js). 

```javascript
Jobs.configure({
	autoStart: Boolean,					// specify if the package should start automatically on Meteor.startup
	interval: Number,					// specify how often the package should check for due jobs
	startupDelay: Number,				// specify how long after server startup the package should start running
	maxWait: Number,					// specify how long the server could be inactive before another server takes on the master role 	disableDevelopmentMode: Boolean,	// development mode assumes that only one server is running, and that it is the active one
	setServerId: Function,				// determine how to set the serverId - for example, you can have the package use your hosts deployment id
	getDate: Function,					// determine how to get the current date, if for whatever reason, new Date() is not suitable
	log: Function,						// determine how to log the package outputs
	remoteCollection: String,			// store jobs data in a remote collection
})
```

### Jobs.register

`Jobs.register` allows you to register logic for a job. Once registered, the package will start a queue to look for and execute jobs as appropriate, and you will be able to run jobs with `Jobs.run`.

```javascript
Jobs.register({
	sendEmail: function (to, content) {
		var send = Magic.sendEmail(to, content);
		
		if (send) {
			this.success()
		} else {
			this.reschedule({
				in: {
					minutes: 5
				}
			})
		}
	},
	sendReminder: function (userId, content) {
		var doc = Reminders.insert({
			to: userId,
			content: content
		})

		if (doc) {
			this.success(doc);
			this.remove();
		} else {
			this.reschedule({
				in: {
					minutes: 5
				}
			})
		}
	}
})
```

Each job is binded with a set of functions to give you maximum control over how the job runs: 
 - `this.doc()` - access job document
 - `this.set(key, value)` - set a persistent key/value pair
 - `this.get(key)` - get a persistent value from key
 - `this.success(result)` - tell the queue the job is completed, and attach an optional result
 - `this.failure(result)` - tell the queue the job failed, and attach an optional result
 - `this.reschedule(config)` - tell the queue to schedule the job for a future date
 - `this.remove()` - remove the job from the queue

Each job must be resolved with success, failure, reschedule, and/or remove, otherwise it will loop infinitely. Not to worry, the queue is smart enough to pause itself if that happens.

For using Promises, see this [GitHub thread](https://github.com/msavin/SteveJobs..meteor.jobs.scheduler.queue.background.tasks/issues/31#issuecomment-366665043).

### Jobs.run

`Jobs.run` allows you to schedule a job to run. You call it just like you would call a method, by specifying the job namea and its arguments. At the end, you can pass in a special configuration object. Otherwise, it will be scheduled to run as soon as possible.

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

The configuration object supports the following inputs:

- **`in`** - Object
	- The `in` parameter will schedule the job at a later time, using the current time and your inputs to calculate the due time.
- **`on`** - Object
	- The `on` parameter override the current time with your inputs.
- **`in` and `on`** - Object
	- The supported fields for in and on can be used in singular and/or plural versions:
		- millisecond, second, minute, hour, day, month, and year
		- milliseconds, seconds, minutes, hours, days, months, and years
	- The date object will be updated in the order that is specified. This means that if it is year 2017, and you set `in` one year, but `on` 2019, the year 2019 will be the final result. However, if you set `on` 2019 and `in` one year, then the year 2020 will be the final result.
- **`priority`** - Number 
	- The default priority for each job is 0
	- If you set it to a positive integer, it will run ahead of other jobs.
	- If you set it to a negative integer, it will only run after all the zero or positive jobs have completed.
- **`date`** - Function
	- Provide your own date. This stacks with the `in` and `on` operator, and will be applied before they run.
- **callback** - Function
	- Run a callback function after scheduling the job

### Jobs.execute

`Jobs.execute` allows you to run a job ahead of its due date. It can only work on jobs that have not been resolved. 

```javascript
Jobs.execute(docId)
```

### Jobs.reschedule

`Jobs.reschedule` allows you to reschedule a job. It can only work on jobs that have not been resolved. 

```javascript
Jobs.reschedule(jobId, {
	in: {
		minutes: 5
	},
	priority: 99999999	
})
```

The configuration is passed in as the second argument, and it supports the same inputs as `Jobs.run`.

### Jobs.replicate

`Jobs.replicate` allows you to replicate a job.

```javascript
Jobs.replicate(jobId, {
	in: {
		minutes: 5
	}
})
```

### Jobs.start

`Jobs.start` allows you start all the queues. This runs automatically unless `autoStart` is set to `false`. If you call the function with no arguments, it will start all the queues. If you pass in a String, it will start a queue with that name. If you pass in an Array, it will loop over the items in it, and treat them like a string.

```javascript
// Start all the queues
Jobs.start()

// Start just one queue
Jobs.start("sendReminder")

// Start multiple queues
Jobs.start(["sendReminder", "sendEmail"])
```

This function currently only works on the server where it is called.


### Jobs.stop

`Jobs.stop` allows you stop all the queues. If you call the function with no arguments, it will stop all the queues. If you pass in a String, it will stop a queue with that name. If you pass in an Array, it will loop over the items in it, and treat them like a string.

```javascript
// Start all the queues
Jobs.start()

// Start just one queue
Jobs.start("sendReminder")

// Start multiple queues
Jobs.start(["sendReminder", "sendEmail"])
```

This function currently only works on the server where it is called. 

### Jobs.get

`Jobs.get` allows you to get a job document by its document id.

```javascript
Jobs.get(docId)
```

A job document looks like this:

```javascript
{
	_id: 'BqjPbF9NGxY4YdnGn',
	name: 'sendEmail',
	created: '2018-05-18T09:48:48.355Z',
	serverId: '7NrBe4QyDsYjxK9xg',
	state: 'success',
	due: '2018-05-18T09:48:48.355Z',
	priority: 0,
	arguments: ['jony@apple.com', 'Hello again'],
	history: [{ 
		date: '2018-05-18T09:48:57.492Z',
		state: 'success',
		serverId: '7NrBe4QyDsYjxK9xg' 
	}]
}
```

The configuration is passed in as the second argument, and it supports the same inputs as `Jobs.run`.

### Jobs.cancel

`Jobs.cancel` allows you to cancel a job if it has not run already.

```javascript
Jobs.cancel(jobId)
```

### Jobs.clear

`Jobs.clear` allows you to clear all or some of the jobs in your database. It supports `state` for selecting a job state, which can be `pending`, `success`, or `failure`, or `*"`to select all of them.

You can add the `name` arguments to specify a specific queue. You can also call an optional callback.

```javascript
var state = "pending";
var name = "sendEmail";
var cb = function (r) { console.log(r) } 
Jobs.clear(state, name, cb)
```

### Jobs.remove

`Jobs.remove` allows you to remove a job from the collection.

```javascript
Jobs.remove(docId)
```

### Jobs.collection

`Jobs.collection` allows you to access the MongoDB collection where the jobs are stored. Ideally, you should not require interaction with the database directly, but hey, we're developers. If you find a case where this is necessary, let me know.