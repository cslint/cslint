'use strict';

var options = require('./options');

var JsProcessor = require('./syntaxes/js');
var CssProcessor = require('./syntaxes/css');

var cli = {

    execute: function (args, text) {

        var currentOptions,
            files;

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

    executeOnFiles: function(files) {
        var options = this.options,
            fn = (options.fix ? 'fix' : 'lint') + 'Files';
         
        new JsProcessor(options)[fn](files).then(done).catch(done);
        new CssProcessor(options)[fn](files).then(done).catch(done);

        function done() {
            var results = [].slice.call(arguments, 0);

            console.log(results[0]);
        }

    }

};

module.exports = cli;
