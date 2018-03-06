<img align="right" width="220" src="https://github.com/msavin/stevejobs/blob/master/ICON.png?raw=true" />

# Steve Jobs: What's New in 3.0

### The Simple Jobs Queue That Just Works

Meteor evolved application development by going from past-time by default to real-time by default. The Steve Jobs package takes the next leap forward by letting your application run in future-time. 😁

The Steve Jobs package allows you to schedule tasks at a future date, in a way that is friendly to the Meteor framework. It provides a wide set of tools to help you get creative, while automating everything behind it.

## Repeating Jobs (!!!)

The most requested feature was also the trickiest to implement, due to how the rest of the queue was built. I didn't want to hack in a completely new set of features on top of what already exists. Fortunately, it turns out there's a really simple way to achieve this effect while staying aligned with how the rest of the queue works.

```javascript
Jobs.register({
    "syncData": function () {
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
                        seconds: 30
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

The job above will try to get data through some means, and then:
  - If it receives the data as expected, it will try to insert it into a MongoDB collection
    - If the insert is successful, it will `replicate` the job and tell it to run in 5 minutes, and then mark the original as a `success`
    - If the insert is not successful, the job will `reschedule` itself to run again in 30 seconds
  - If it does not receive the data as expected, it will `reschedule` itself to run again in 5 minutes

`this.replicate` basically replicates the job and its arguments, while allowing you to set a new configuration for it. This enables you to repeat a job as many times as you wish, while dynamically setting the conditions for how it should happen.

It's important to use `this.replicate` instead of `this.reschedule` to repeat a job because each job keeps track of its history. If you reschedule a job too many times, it's document would become humongous, which could have consequences. Additionally, using `this.replicate` makes it easier for your clear resolved job documents in the future.

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

Each job can hold its own state thanks ot `this.set` and `this.get` - meaning if you experience an interruption, you can get the job to pick up where it left off. It can also be used to display things like progress bars.

Additionally, `this.failure` is automatically called inside of a try `try catch` block when the code has an error. If your code works fine and the job "failed" for reasons other than code execution, I suggest using `this.reschedule` instead. 

## New Configuration Options

`Jobs.configure` now allows you to customize three more core functions of the Jobs package: `setServerId`, `getDate` and `log`.

With `getServerId`, you can now specify the mechanism for generating a unique server ID. By default, this uses `Random.id()`, but after @gary-menzel's suggestion, it made sense to open this function for customization so that it can be integrated with the server ID that you hosting service may assign.

With `getDate`, you can now specify how a new Date object should be initialized. By default, the function will return `new Date()`. With this option, you can, for example, return a Date object that has a future date, to create a "time travel" effect. Thanks to the person who suggested this.

With `log`, you can configure how your application should log items. By default, the function will use `console.log`. 

## Smarter MongoDB Querying

Of all the pleasures that MongoDB offers, peace of mind is not one of them. 

First, it can take a bit of time for the writes to be reflected in the reads, and that could make jobs run twice. 

This was resolved by adding an extra condition to the MongoDB queries: the document must meet this criteria, _and_ its `_id` must not be that of the job that had just run.

Second, it turns out that MongoDB's upsert function may not be so reliable - if you run a few upserts at once, MongoDB might just insert all the documents. This is probably related to the first issue.  This created a problem with the `dominator` function, as the queue might get confused as to which server is active.

This has been resolved by making the `serverId` field unique. It looks like MongoDB becomes more diligent when you set a unique field.

## What's Next?

As is - the Steve Jobs package does its job well, and works great with Meteor.

I'm excited about transactions coming MongoDB 4.0. Along with Write Concerns, Retryable Writes, and the new storage engine, this can be used to make the queue _really_ reliable.
    - In some jobs, you might need to run two database operations, such  `this.replicate` and `this.success`, to successfully resolve the job. It would be nice if the two can be combined to assure that both actions happened successfully.
    - It could also be helpful in designing a mechanism to keep track of many jobs running across many servers.

MongoDB 4.0 is coming in the summer, so I will evaluate then whether to keep evolving the project or to simply maintain what it does now.

The idea is, this could grow into a reliable queue that can run many jobs at once and scale horizontally. It would not be the fastest solution, but it may be so reliable, scalable and developer friendly, that speed would seem overrated.

If that were achieved, the next step would be to build an interface and REST API to let anyone run this as a standalone service.

**With that said, your help can go a long way!** I'm looking for someone to design and implement the testing strategy, and for help in taking on the challenge of scaling the queue to run many jobs at once. If you can help with this, or if you have a different angle, do reach out!