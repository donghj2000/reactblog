let copydir = require("copy-dir");

copydir.sync(process.cwd() + "/src/assets", process.cwd() + "/dist/assets", {
	utimes: true,
	mode: true,
	cover: true
}, function(err) {
	if (err) 
		throw err;
	console.log("copy static files done.");
});