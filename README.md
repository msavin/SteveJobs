<img align="right" width="220" src="https://github.com/msavin/stevejobs/blob/master/avatar.png?raw=true" />

# Steve Jobs

# The simple jobs queue that just works. 

**NOT WORKING / IN DEVELOPMENT.** Steve Jobs makes it really easy to run scheduled tasks. It's designed to work with fibers, and works by setting a MongoDB collection and using `Meteor.setTimeout`.

# How to Use

First, install the package:

	meteor add msavin:stevejobs

Second, define your jobs as Methods: 

```javascript
Meteor.methods({
	sendReminderEmail: function (messageContent) {
		magicFunction(messageContent)
	}
})

```

Finally, schedule the job :

```javascript
// Must use only `in` or `on`
// Both are used here for demonstration purposes

Jobs.add({
	name: sendReminderEmail,
	parameters: {
		to: "john@smith.com",
		message: "hi this is your reminder"
	},
	in: {
		days: 1,
		hours: 3,
		minutes: 14
	},
	on: {
		month: 0,
		day: 1,
		hour: 23
	}
})
```

# Pending Work

 - Make it work
 - Ensure this only runs on one server to prevent a job from running twice
 - Fix up API
 - Switch to defining jobs as functions instead of Methods
 - Develop in/on logic for scheduling jobs
 - Upgrade to module approach