## Future Plans (Contributions Welcome)

The package completes its goal of helping you run scheduled tasks in a simple and predictable way. However, it doesn't have to stop there. Here are some ideas - feel free to open a ticket about implementing one of them or proposing something new.

If you would like to make a pull request, please start a ticket to discuss it first.

**v1.2**
 - Update date function
    - use new numbers functions to enable functions and strings as inputs for numbers
    - Add support for timezones with-in the `on` field
         - The idea is, this will work if the package detects moment.js in the app
 - Add Jobs.reschedule() to rescheduling a job
 - Update Jobs.clear() to remove jobs that are no longer registered
 - Add jobs history
 - Make a way to stop the queue across all servers
  

**v2.0 - Under Consideration**
 - Add a way to run repeatable jobs
 - Add support for hooks
 - Make the package a module

**v2.1**
 - Add alerts if jobs are failing
 - Add a way to pause the queue if a job fails 
 - Pause jobs, or switch servers, if CPU usage is over X

**Future (?)**
 - Microservice mode