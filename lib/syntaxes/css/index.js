'use strict';

var fs = require('fs');
var path = require('path');
var merge = require('deepmerge');
var tmp = require('tmp');

var stylelint = require('stylelint');
var postcss = require('postcss');
var scss = require('postcss-scss');
var stylefmt = require('stylefmt');

var defaultOptions = require('./config');
var globUtil = require('../../util/glob-util');

function isCss(filePath) {
    return /^\.css|\.scss$/i.test(path.extname(filePath));
}

function getMatchedFiles(patterns) {
    return globUtil.listFilesToProcess(patterns, {extensions: ['scss', 'css']}) || [];
}

function fixFile (filePath, configPath) {
    if (!isCss(filePath)) {
        return '';
    }
    var css = fs.readFileSync(filePath, 'utf-8');

    return new Promise(function (resolve, reject) {
        postcss([stylefmt({config: configPath})])
            .process(css, {syntax: scss}).then(function (result) {
                var formatted = result.css;

                if (css !== formatted) {
                    fs.writeFile(filePath, formatted, function (err) {
                        if (err) {
                            throw err;
                        }
                        resolve(formatted);
                    });

                } else {
                    resolve(formatted);
                }
            }).catch(function (err) {
                console.log(err.stack);
                reject(err);
            });
    });
}

function CssProcessor(options) {
    this.options = merge(defaultOptions, options.userConfig['stylelint'] || {});

    if (options.format == 'json') {
        this.formatter = require('./jsonFormatter');
    } else {
        this.formatter = require('./formatter');
    }

}

CssProcessor.prototype.lintFiles = function (patterns) {

    var fileList = getMatchedFiles(patterns);

    if (!fileList.length) {
        return;
    }

    return stylelint.lint({
        config: this.options,
        configBasedir: path.resolve(__dirname),
        files: fileList,
        formatter: this.formatter
    }).then(function (resultObject) {
        return resultObject.output;
    }).catch(function (err) {
        console.log(err.stack);
        process.exit(err.code || 1);
    });
};

CssProcessor.prototype.fixFiles = function (patterns) {

    var fileList = getMatchedFiles(patterns), promiseArr = [];

    if (!fileList.length) {
        return '';
    }

    var tmpfile = tmp.fileSync({prefix: 'tmp-', postfix: '.json', keep: true});

    fs.writeSync(tmpfile.fd, JSON.stringify(require('stylelint-config-sm')));

    fileList.forEach(function (fullPath, i) {
        promiseArr.push(fixFile(fullPath, tmpfile.name));
    }.bind(this));

    return Promise.all(promiseArr).then(function (results) {
        tmpfile.removeCallback();
        return this.lintFiles(patterns);
    }.bind(this)).catch(function (reasons) {
        process.exit(err.code || 1);
    });
};

module.exports = CssProcessor;
