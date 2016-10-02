'use strict';

var fs = require('fs');
var path = require('path');
var stylelint = require('stylelint');
var merge = require('deepmerge');

var postcss = require('postcss');
var scss = require('postcss-scss');
var stylefmt = require('stylefmt');
var tmp = require('tmp');

var defaultOptions = require('./config');
var globUtil = require('../../util/glob-util');
var ConfigHelper = require('../../util/config-helper');

var configHelper = new ConfigHelper();
var personalConfig = configHelper.getConfig();

var options = merge(defaultOptions, personalConfig['stylelint'] || {});

function isCss(filePath) {
    return /^\.css|\.scss$/i.test(path.extname(filePath));
}

function getMatchedFiles(patterns) {
    return globUtil.listFilesToProcess(patterns, {extensions: ['scss', 'css']}) || [];
}

module.exports = {

    lintFiles: function (patterns, opts) {

        var fileList = getMatchedFiles(patterns);

        if (!fileList.length) {
            return;
        }

        return stylelint.lint({
            config: options,
            configBasedir: path.resolve(__dirname),
            files: fileList,
            formatter: require('./formatter')
        }).then(function (resultObject) {
            return resultObject.output;
        }).catch(function (err) {
            console.log(err.stack);
            process.exit(err.code || 1);
        });
    },

    fixFile: function (filePath, configPath) {
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
    },
    fixFiles: function (patterns) {

        var fileList = getMatchedFiles(patterns), promiseArr = [];

        if (!fileList.length) {
            return '';
        }

        var tmpfile = tmp.fileSync({prefix: 'tmp-', postfix: '.json', keep: true});

        fs.writeSync(tmpfile.fd, JSON.stringify(options));

        fileList.forEach(function (fullPath, i) {
            promiseArr.push(this.fixFile(fullPath, tmpfile.name));
        }.bind(this));

        return Promise.all(promiseArr).then(function (results) {
            tmpfile.removeCallback();
            return this.lintFiles(patterns);
        }.bind(this)).catch(function (reasons) {
            process.exit(err.code || 1);
        });
    }
};
