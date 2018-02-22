# Jobs - Operator.queue

This object ensures that only job is processed at a time (and on one server)
It starts a new runner for each queue that you register
Queues can be accessed with Jobs.queue

## How it works
1. when a server starts up, it will run the start function after a slight delay
2. When the start function runs, it'll start an interval timer for every X seconds (5 is default)
3. When the interval timer runs, it will check that the server is active via `control.js`
4. If the server is active, it will look for jobs to run

## How jobs are ran
1. first, the queue will check if there are failed jobs. if there are, it will try to run them again
2. after the failed jobs are processed, it will check for new jobs and run them
3. jobs are based on whichever comes first (and ultimately, whatever MongoDB returns to us)

When a job completes, Jobs will check if there are more jobs to run.
If there are more jobs to run, Jobs will continue to run them consecutively. 

When a job is running, JobsRunner will ignore the setInterval calls because the queue will marked as busy. 

If there are no more jobs to run, Jobs will go back to polling with setInterval

## Protecting against stale reads
Sometimes, MongoDB takes a bit of time to reflect its writes in the reads. To protect against a job running twice, the queue will keep track of which doc it ran last, and ensure that it does not come up in the next query. 
