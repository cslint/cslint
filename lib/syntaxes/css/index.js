'use strict';

var fs = require('fs');
var path = require('path');
var util = require('../../util');

var stylelint = require('stylelint');
var postcss = require('postcss');
var scss = require('postcss-scss');
var stylefmt = require('stylefmt');

var defaultOptions = require('./config');
var globUtil = require('../../util/glob-util');

function getMatchedFiles(patterns) {
    return globUtil.listFilesToProcess(patterns, {extensions: ['scss', 'css']}) || [];
}

function CssProcessor(options) {
    this.options = defaultOptions;

    if (options.format == 'json') {
        this.formatter = require('./jsonFormatter');
    } else {
        this.formatter = require('./formatter');
    }

}

CssProcessor.prototype.lintFiles = function (patterns) {

    var fileList = getMatchedFiles(patterns);

    if (!fileList.length) {
        return Promise.resolve('');
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
        return Promise.resolve('');
    }

    fileList.forEach(function (fullPath, i) {
        promiseArr.push(this.fixFile(fullPath));
    }.bind(this));

    return Promise.all(promiseArr).then(function (results) {
        return this.lintFiles(patterns);
    }.bind(this)).catch(function (err) {
        process.exit(err.code || 1);
    });
};

CssProcessor.prototype.fixFile = function (filePath) {
    
    if (!util.isCssLike(filePath)) {
        return Promise.resolve('');
    }

    var css = fs.readFileSync(filePath, 'utf-8'),
        config = this.options;

    return postcss([stylefmt({
        from: filePath,
        config: config,
        configBasedir: path.resolve(__dirname)
    })]).process(css, {syntax: scss}).then(function (result) {
        var formatted = result.css;

        if (css !== formatted) {
            fs.writeFile(filePath, formatted);
        }
    });
};

module.exports = CssProcessor;
