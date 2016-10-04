(function (require, process) {

    var fs = require('fs'),
        minifyJs = require('minify'),
        pathJs = require('path'),
        dir = __dirname.replace(/\\/g, '/'),
        sourcePath = dir.replace('tools', ''),
        foldersToIgnore = ['node_modules', 'build', '.git', 'tools'],
        filesToIgnore = ['publish.bat', '.gitattributes', '.gitignore'],
        logger = function (msg) {
            console.log(msg);
        },
        createDirectory = function (folderPath) {
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            };
        },
        isDirectory = function (path) {
            return fs.statSync(path).isDirectory();
        },
        isJsFile = function (fileName) {
            return fileName.match(/\.js$/i);
        },
        processFolder = function (src, dest) {
            fs.readdir(src, function (err, items) {
                items.forEach(function (item) {
                    var newDest = pathJs.join(dest, item),
                        newSrc = pathJs.join(src, item);

                    if (isDirectory(newSrc)) {
                        if (foldersToIgnore.indexOf(item) == -1) {

                            createDirectory(newDest);
                            processFolder(newSrc, newDest);
                        };
                    }
                    else {
                        processFile(newSrc, newDest, item);
                    };
                });
            });
        },
        processFile = function (src, dest, item) {
            if (isJsFile(item)) {
                minifyJs(src, function (error, data) {
                    if (error) {
                        logger(error.message);
                    }
                    else {
                        fs.writeFile(dest, data, function (err, fileRef) {
                            if (err) {
                                logger(err.message);
                            }
                            else {
                                logger(src + ' JS file minified Successfully!!!');
                            };
                        });
                    };
                });
            }
            else {
                (filesToIgnore.indexOf(item) == -1) && fs.createReadStream(src).pipe(fs.createWriteStream(dest));
            };
        },
        startBuild = function (destinationPath) {
            console.log(destinationPath);
            processFolder(sourcePath, destinationPath);
        };

    try {
        var destinationPath = process.argv[2] ? process.argv[2].replace('"', '') : dir.replace('tools', 'build');
        createDirectory(destinationPath);
        startBuild(destinationPath);
    }
    catch (err) {
        logger(err);
    }

})(require, process);