# Jobs - Operator.dominator

This object ensures that only one server is processing jobs

How it works
1. Each server is automatically given an id 
2. Every 5 seconds, the server checks to see if it is active
3. If it is active, it updates a MongoDB document with its id and a timestamp 
4. If it is not active, it checks to see when a server was last active
4a. If the last active timestamp was greater than `activityGap`, the server who discovered this will step up to manage 
4a. If the last active timestamp was less than `activeDelay`, the server will not do anything

These checks happen every 5 seconds, or as as defined with `timer` in `runner.js`.  

`activityGap` refers to how much time is permitted between the last timestamp update and current time.