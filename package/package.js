Package.describe({
	name:    "msavin:sjobs",
	summary: "The simple jobs queue that just works. (kw: synced, schedule tasks, background, later, worker, cron)",
	version: "1.0.0"
});

serverFiles  = [
	"server/private.js",
	"server/public.js",
	"server/control.js",
	"server/runner.js",
	"server/startup.js"
];

Package.onUse(function(api) {
	api.use(["mongo"]);
	api.addFiles(serverFiles, "server");
	api.versionsFrom("1.0");
	api.export(["Jobs", "JobsControl", "JobsRunner"])
});