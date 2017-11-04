Package.describe({
	name:    "msavin:sjobs",
	summary: "The simple jobs queue that just works [synced, schedule, tasks, background, later, worker, cron]",
	version: "1.1.0",
	documentation: "README.md",
	git:     'https://github.com/msavin/SteveJobs.git',
});

serverFiles  = [
	"server/private.js",
	"server/utilities.js",
	"server/control.js",
	"server/runner.js",
	"server/public.js",
	"server/startup.js",
];

Package.onUse(function(api) {
	api.use(["mongo", "random"], "server");
	api.addFiles(serverFiles, "server");
	api.versionsFrom("1.0");
	api.export(["Jobs", "JobsControl", "JobsRunner"])
});