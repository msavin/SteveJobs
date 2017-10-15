# Steve Jobs - How It Works

## One Job At a Time

The Steve Jobs package is quite like Steve Jobs, and quite unlike him at the same time. In favor of ease and simplicity, the package does not aim to run its jobs on the dot. Instead, it checks for new jobs every 30 seconds and runs only one job at a time. Additionally, if a server goes down, it could take 5 minutes for the package to start running on a different server. Both of these timers could be modified to your preference.

## One Server At a Time

To avoid potential screw-ups with MongoDB read/write performance, the package will claim one server and run from there. If that server goes down, another server will take over. The new server is claimed based on whoever picks it first.

## In Development Mode

For the smoothest development experience, this package automatically checks out your local development server as active. This is to keep the package from running slower than expected, because may restart frequently in development.

## Job States (needs to be rewritten)

Jobs can have four different states, which are marked by a number for MongoDB indexing purposes:
 - 1 - Pending
 - 2 - Failed
 - 3 - Succeeded
 - 4 - Canceled

## Success and Failure (needs to be rewritten)

Jobs will automatically archive jobs. There are three types of jobs: failed, successful, and pending. 
  - Jobs that succeed will stay in the database. They can be cleared at your preference with `Jobs.clear(numberOfDays)`.
  - Jobs that fail will try to run again the next time the server restarts. (Never give up!)
  - Jobs that are pending will sit and wait their turn. They could be removed with `Jobs.remove`, or be forced to run early with `Jobs.run`.

## Fibers-based Timing

The package leverages `Meteor.setInterval` to do its work. While the idea of timeouts may not sound like a good idea on the server - it may actually be the right approach because Meteor's timing functions leverage Fibers.

## MongoDB Indexing

Steve Jobs will create two collections, one for jobs and another for communicating with other servers. The jobs one will 

## Future Ideas (Contributions Welcome)

 - Create a way to run jobs across multiple servers. One easy way to do this is by playing with the MongoDB document ID's. For example, if the first character is a letter, use server one, if its a letter, use server two.
 - Create a way for the server to pause jobs if the CPU usage is high. Every little bit helps, right?
 - Create a way for a server with lower CPU consumption to take over the jobs queue if possible.
 - Create a way to run jobs as a microservice.
 - Create a way to repeat jobs.

## Timezones

This package will use the servers timezone to base all of its operations. This should ensure that jobs run predictably, because they are designed to run on relative time (i.e. do this in  30 minutes). You can also set the timezone on your server using the `TZ` environment variable.