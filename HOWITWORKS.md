# Steve Jobs Package - How It Works

## Runs One Job At a Time

The Steve Jobs package is quite like Steve Jobs, and quite unlike him at the same time. In favor of ease and simplicity, the package does not aim to run its jobs on the dot. 

Instead, it checks for new jobs every 5 seconds and runs only one job at a time. Whenever it runs a job, it will then check if there are more jobs pending. If there are not, it will go back to checking every 5 seconds. 

## Runs on One Server At a Time

To avoid potential screw-ups with MongoDB read/write performance, the package will claim one server and run from there. If that server goes down, another server will take over.

Whenever a server starts up, it will be given a randomly generated id. It will then check if there is a server processing jobs, and if not, it will use its id to mark its presence in a MongoDB document. Other servers will automatically check if it is active. If one of them finds that it is not, it will take over the work.

## Development Mode

For the smoothest development experience, this package automatically checks out your local development server as the active server. This is to keep the package from running slower than expected, because may restart frequently in development.

## Job States 

Jobs can have four different states:
 - Pending
 - Failed
 - Succeeded
 - Canceled

Jobs that have failed will be re-tried whenever the a server starts processing jobs. It will attempt to run them one at a time until it goes through all of them. After that, it will go through the pending jobs. After that, it will poll the database every 5 seconds to see if there is anything new to do.

Jobs that are Pending and/or Failed can be canceled with `Jobs.cancel`. Jobs that have succeeded or are canceled can be cleared with `Jobs.clear`.

## Fibers-based Timing

The package leverages `Meteor.setInterval` to do its work. While the idea of timeouts on a server may not sound like a good idea - it may actually be the right approach because the  Meteor's timing functions leverage Fibers.

## MongoDB Indexing

Steve Jobs will create two collections, one for jobs and another for communicating with other servers. The one with the jobs one is indexed by time and state for optimal performance.

## Timezones

This package will use the servers timezone to base all of its operations. This should ensure that jobs run predictably, because they are designed to run on relative time (i.e. do this in  30 minutes). You can also set the timezone on your server using the `TZ` environment variable.

## Future Ideas (Contributions Welcome)

 - Create a way to run jobs across multiple servers. One easy way to do this is by playing with the MongoDB document ID's. For example, if the first character is a letter, use server one, if its a letter, use server two.
 - Create a way for the server to pause jobs if the CPU usage is high. Every little bit helps, right?
 - Create a way to run jobs as a microservice.
 - Create a way to repeat jobs. (Perhaps this should be another package?)
 - Create a way for people to place their own timezones
 - Create a way to expedite certain jobs