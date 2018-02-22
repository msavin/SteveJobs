# Steve Jobs: What's New in 3.0 (DRAFT)

Meteor evolved application development by going from past-time by default to real-time by default. The Steve Jobs package takes the next leap forward by letting your application run in future-time. 😁

The Steve Jobs package allows you to schedule tasks at a future date, in a way that is friendly to Meteor developers and the Meteor framework. It provides a wide set of tools to help you get creative, and automates everything in between storing jobs to running them.

## Repeating Jobs (!!!)

The most requested feature was also the trickiest to implement, due to how the rest of the queue was built. I didn't want to just hack in a completely new set of features on top of what already exists. However, after a bit of thinking, I found a really simple solution that acheives the desired effect and fits right in with how the queue works.

```javascript
Jobs.register({
    "checkForNewData": function () {
        var self = this;
        var data = getDataFromSomewhere();

        if (data) {
            var doc = MyCollection.insert(data);

            if (doc) {
                self.replicate({
                    in: {
                        minutes: 5
                    }
                })

                self.success(doc)
            } else {
                self.reschedule({
                    in: {
                        minutes: 5
                    }
                })
            }
        } else {
            self.reschedule({
                in: {
                    minutes: 5
                }
            })
        }
    }
})
```

The job above will try to get data through some means.
    - If it receives the data as expected, it will try to insert it into a MongoDB collection
        - If the insert is successful, it will replicate the job and tell it to run in 5 minutes, and then mark the original as successful
        - If the insert is not successful, the job will reschedule itself to run again in 5 minutes
    - If it does not receive the data as expected, it will try to run again in 5 minutes

`this.replicate` basically replicates the job and its arguments, while allowing you to set a new configuration for it. This enables you to repeat a job as many times as you wish, while dynamically setting the conditions for how it happens.

It's important to use `this.replicate` instead of `this.reschedule` to repeat a job because each jobs keeps track of its history. If you run reschedule a job too many times, it's document would become humongous, which could have different kinds of consequences. Additionally, using `this.replicate` makes it easier for your clear resolved job documents in the future.

For jobs that that run very frequently, you can also use the new `this.remove` feature to remove the document from the database rather than just mark it as complete.

## More Tools for Designing Your Jobs

When you register a job with `Jobs.register`, you can access a wide array of tools to make sure the job runs exactly the way you want it to:
 - `this.document` - access the cached document of the current job
 - `this.set` & `this.get` - persistent state management for the current job
 - `this.success` - mark the job as successful
 - `this.failure` - mark the job as having failed
 - `this.reschedule` - tell the job to run again later
 - `this.replicate` - replicate the job with the same arguments
 - `this.remove` - remove the job from the collection

Every job must be resolved with `this.success`, `this.failure`, `this.reschedule`, or `this.remove`, otherwise the queue will log an error and stop running. This is to ensure that a job does not end up looping infinitely.

Additionally, `this.failure` is inside an internal `try catch` when the code fails to run. Feel free to use it as you wish, but, if your code works fine and the job failed for some other reason, I suggest using `this.reschedule` instead.

For more information, see: 
 - Documentation for Jobs tools
 - How job failure is handeled

## New Configuration Options

Jobs.configure now allows you to customize three core functions of the Jobs package: `setServerId`, `getDate` and `log`.

With `getServerId`, you can now specify the mechanism for generating a unique server ID. By default, this uses `Random.id()`, but after @person suggestion, it made sense to open this function for customization so that it can be integrated with the server ID that you hosting service may assign.

With `getDate`, you can now specify how a new Date object should be initialized. By default, the function will return `new Date()`. With this option, you can, for example, return a Date object that has a future date, to create a "time travel" effect. Thanks @person for the idea.

With `log`, you can configure how your application should log items. By default, the function will use `console.log`. 

For more information, see:
 - Documentation for changing the default configuration
 - Code of the default configuration

## Smarter MongoDB Querying

Of all the pleasures that MongoDB offers, peace of mind is not one of them. 

First, it sometimes takes a bit of time for the writes to be reflected in the reads, so I implemented an extra condition to the MongoDB queries: the document must meet this criteria, and its `_id` must not be that of the job that just ran.

Second, it turns out that MongoDB's upsert function may not be so reliable - if you run a few upserts right next to each other, MongoDB might just insert all the documents. This is tied to the first issue. 

This created a problem with the `dominator` function. It might create multiple documents to track which server is running the jobs, and that might confused the tracking process. It's been resolved by making the `serverId` field unique. 

## What's Next?

As is - the Steve Jobs package does its job well, and works great with Meteor.

I'm excited about transactions coming MongoDB 4.0. Along with Write Concerns and Retryable Writes, because this can be used to make the queue _really_ reliable.
    - In some jobs, you might need to run two database operations, such  `this.replicate` and `this.success`, to successfully resolve the job. It would be nice if the two can be combined to assure that both action happened successfully.
    - This could be helpful in designing a mechanism to keep track of many jobs running across many servers

MongoDB 4.0 is coming in the summer, so I will evaluate then whether to keep evolving the project or just keep it as is. So long as Meteor doesn't go through a dramatic change, it should work fine. Either way, if you run into some issues, feel free to let me know.

This could grow into a reliable queue that can run many jobs at once and scale horizontally. It may not be the fastest solution, but maybe it can be so reliable, scalable and friendly that speed would seem overrated.

If that were achieved, the next step would be to build an interface and REST API to let anyone run this as a standalone service.

**With that said, your help can go a long way!** I'm looking for someone to design and implement the testing strategy, and for help in taking on the challenge of scaling the queue to run many jobs at once. If you can help with this, or if you have a different angle, get in touch :)