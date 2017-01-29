'use strict';

var CLIEngine = require('eslint').CLIEngine;

var defaultOptions = require('./config');
var globUtil = require('../../util/glob-util');

function getMatchedFiles(patterns) {
    return globUtil.listFilesToProcess(patterns, {extensions: ['js']}) || [];
}

function JsProcessor(options) {

    this.options = defaultOptions;

    if (!this.engine) {
        this.engine = new CLIEngine(this.options);
    }

    if (options.format == 'json') {
        this.formatter = require('./jsonFormatter');
    } else {
        this.formatter = require('./formatter');
    }
}

JsProcessor.prototype.lintFiles = function (patterns) {

    return new Promise(function (resolve, reject) {
        var report,
            fileList = getMatchedFiles(patterns);

        if (fileList.length) {
            this.engine.options.fix = false;
            report = this.engine.executeOnFiles(fileList);
            resolve(this.formatter(report.results));
        } else {
            resolve('');
        }

    }.bind(this));
};

JsProcessor.prototype.fixFiles = function (patterns) {

    return new Promise(function (resolve, reject) {
        var report,
            fileList = getMatchedFiles(patterns);

        if (!fileList.length) {
            resolve('');
            return;
        }

        this.engine.options.fix = true;
        report = this.engine.executeOnFiles(fileList);

        CLIEngine.outputFixes(report);

        resolve(this.formatter(report.results));

    }.bind(this));
};

module.exports = JsProcessor;
