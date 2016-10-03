(function (require, process) {

    var fs = require('fs'),
        minify = require('minify'),
        path = require('path'),
        dir = __dirname.replace(/\\/g, '/'),
        startBuild = function (basePath) {
            console.log(basePath);
        };

    try {
        var basePath = process.argv[2] ? process.argv[2].replace('"', '') : dir;

        fs.readdir(dir.replace('tools', ''), function (err, items) {
            items.forEach(function (item) {
                console.log(item);  // TODO: group by file type and folders and proceed with logic to minify.
            });
        });
        startBuild(basePath);
    }
    catch (err) {
        console.log(err);
    }

})(require, process);