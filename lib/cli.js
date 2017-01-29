'use strict';

var options = require('./options');

var JsProcessor = require('./syntaxes/js');
var CssProcessor = require('./syntaxes/css');
var ConfigHelper = require('./util/config-helper');

var cli = {

    execute: function (args, text) {

        var currentOptions,
            files,
            configHelper = new ConfigHelper();

        try {
            currentOptions = options.parse(args);
        } catch (error) {
            console.error(error.message);
            return 1;
        }

        this.options = Object.assign(
            Object.create(null), 
            {cwd: process.cwd()}, 
            {extensions: currentOptions.ext || []}, 
            {userConfig: configHelper.getConfig()},
            currentOptions
        );

        files = currentOptions._;

        if (currentOptions.version) { // version from package.json

            console.info('v' + require('../package.json').version);

        } else if (currentOptions.help || !files.length && !text) {

            console.info(options.generateHelp());

        } else {

            if (text && currentOptions.fix) {
                console.error('The --fix option is not available for piped-in code.');
                return 1;
            }

            this.executeOnFiles(files);

        }

        return 0;
    },

    executeOnFiles: function (files) {
        var options = this.options,
            fn = (options.fix ? 'fix' : 'lint') + 'Files';

        var jsProcessor = new JsProcessor(options);
        var cssProcessor = new CssProcessor(options);

        jsProcessor[fn](files).then(done, fail);
        cssProcessor[fn](files).then(done, fail);

        function done(results) {
            console.log(results);
        }

        function fail(err) {
            console.track(err);
        }
    }

};

module.exports = cli;
