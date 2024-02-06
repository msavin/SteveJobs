# Steve Jobs / Server / Folder Contents

The `api.js` file imports all the package functionality and exposes a public API for developers to use on the server. 

Features of the public API: 
 - every function has argument checking for maximum security and reliability
 - every function is private and can only be called on the server
 - `JobsInternal` exposes package internals for debugging

-----

The public API obtains its functionality from the `imports` folder, which is broken up into three folders:
 - `actions` - all the actions possible with-in the queue, such as adding a job, executing a job, rescheduling a job, etc
 - `operator` - automatically checks for whichs jobs to run, ensures the right conditions for them to run in, and runs them
 - `utilities` - helper functions and shared functionality for `actions` and `operator`
 - `startup` - startup functions for the server, used to start Operator