
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

        } else if (currentOptions.help || (!files.length && !text)) {

            console.info(options.generateHelp());

        } else {

            if (text && currentOptions.fix) {
                console.error('The --fix option is not available for piped-in code.');
                return 1;
            }

            this.executeOnFiles(files);

            return 1;

        }

        return 0;
    },

    executeOnFiles: function (patterns) {
        var options = this.options,
            fn = (options.fix ? 'fix' : 'lint') + 'Files';

        var jsProcessor = new JsProcessor(options)
        var cssProcessor = new CssProcessor(options)


        var p1 = jsProcessor[fn](patterns);
        var p2 = cssProcessor[fn](patterns);

        Promise.all([p1, p2]).then(function (results) {
            results.forEach(function (output, i) {
                if (output) {
                    console.log(output);
                }
            });
        }).catch(function (reasons) {
            reasons.forEach(function (reason, i) {
                console.error(reason);
            });
        });
    }

};

module.exports = cli;
