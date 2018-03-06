# Jobs - Startup

The startup function will wait 5 seconds after Meteor starts up to run the code and start the queues. This is to ensure that your application had enough time to set your configuration settings.

When a job is registered, it's queue will wait for the startup even to be started. If the job is registered after the startup function has ran, that job will be started automatically.