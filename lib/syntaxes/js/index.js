'use strict';

var CLIEngine = require('eslint').CLIEngine;
var merge = require('deepmerge');

var defaultOptions = require('./config');
var globUtil = require('../../util/glob-util');

function getMatchedFiles(patterns) {
    return globUtil.listFilesToProcess(patterns, {extensions: ['js']}) || [];
}

function JsProcessor(options) {

    this.options = merge(defaultOptions, {
        baseConfig: merge({extends: 'sm'}, options.userConfig['eslint'] || false),
        root: true,
        useEslintrc: false
    });

    if (!this.engine) {
        this.engine = new CLIEngine(this.options);
    }

    if (options.format == 'json') {
        this.formatter = CLIEngine.getFormatter('json');
    } else {
        this.formatter = require('./formatter');
    }
}

JsProcessor.prototype.lintFiles = function(patterns) {

    return new Promise(function (resolve, reject) {
        var report,
            fileList = getMatchedFiles(patterns);

        if (!fileList.length) {
            resolve();
            return;
        }

        this.engine.options.fix = false;
        
        var report = this.engine.executeOnFiles(fileList);

        resolve(this.formatter(report.results));

    }.bind(this));
};

JsProcessor.prototype.fixFiles = function(patterns) {

    return new Promise(function (resolve, reject) {
        var report, 
            fileList = getMatchedFiles(patterns);

        if (!fileList.length) {
            resolve();
            return;
        }

        this.engine.options.fix = true;
        report = this.engine.executeOnFiles(fileList);
        
        CLIEngine.outputFixes(report);
        
        resolve(this.formatter(report.results));

    }.bind(this));
};
module.exports = JsProcessor; 
