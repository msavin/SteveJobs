Package.describe({
	name:    "msavin:sjobs",
	summary: "The simple jobs queue that just works [synced, schedule, tasks, background, later, worker, cron]",
	version: "5.0.0",
	documentation: "README.md",
	git:     "https://github.com/msavin/SteveJobs.git",
});

Package.onUse(function(api) {
  api.versionsFrom('2.8.1');
	api.use(["mongo", "random", "ecmascript", "check"], "server");
	api.mainModule("server/api.js", "server");
	api.export(["Jobs", "JobsInternal"]);
});
