Package.describe({
	name:    'msavin:stevejobs',
	summary: 'Simple Jobs Que',
	version: '1.0.0'
});

serverFiles  = [
	'server/runner.js'
	'server/private.js',
	'server/public.js',
];

Package.onUse(function(api) {
	api.use(['mongo']);
	api.addFiles(serverFiles, 'server');
	api.versionsFrom('1.0');
	api.export('Jobs')
});