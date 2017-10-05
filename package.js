Package.describe({
	name:    'msavin:stevejobs',
	summary: 'Simple Jobs Cue',
	version: '1.0.0'
});

serverFiles  = [
	'server/internal.js',
	'server/runner.js',
	'server/public.js',
];

Package.onUse(function(api) {
	api.addFiles(serverFiles, 'server');
	api.versionsFrom('1.0');
});