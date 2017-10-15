Package.describe({
	name:    'msavin:sjobs',
	summary: 'A simple jobs que that just works',
	version: '1.0.0'
});

serverFiles  = [
	'server/private.js',
	'server/public.js',
	'server/control.js',
	'server/runner.js'
];

Package.onUse(function(api) {
	api.use(['mongo']);
	api.addFiles(serverFiles, 'server');
	api.versionsFrom('1.0');
	api.export('Jobs')
});