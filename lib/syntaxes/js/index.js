'use strict';

var CLIEngine = require('eslint').CLIEngine;
var merge = require('deepmerge');

var defaultOptions = require('./config');
var formatter = require('./formatter');
var ConfigHelper = require('../../util/config-helper');
var globUtil = require('../../util/glob-util');

var configHelper = new ConfigHelper();

var personalConfig = configHelper.getConfig();

var options = merge(defaultOptions, {
    baseConfig: merge({extends: 'sm'}, personalConfig['eslint'] || false),
    root: true,
    useEslintrc: false
});

var engine = new CLIEngine(options);

module.exports = {
     
    lintFiles: function (patterns) {
        engine.options.fix = false;

        return new Promise(function (resolve, reject) {
            var fileList = globUtil.listFilesToProcess(patterns, {extensions: ['js']});

            if (!fileList.length) {
                resolve();
                return;
            }
            var report = engine.executeOnFiles(fileList);

            resolve(formatter(report.results));
        });
    },

    fixFiles: function (patterns) {
        engine.options.fix = true;

        return new Promise(function (resolve, reject) {
            var report = engine.executeOnFiles(patterns);

            CLIEngine.outputFixes(report);

            resolve(formatter(report.results));
        });
    }
};
