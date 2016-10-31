/*
 * This code is taken from eslint repo
 * (https://github.com/eslint/eslint)
 * and modified to meet our needs.
 */

/**
 * @fileoverview Stylish reporter
 * @author Sindre Sorhus
 */
'use strict';

var chalk = require('chalk'),
    table = require('text-table'),
    symbols = require('log-symbols');

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word, count) {
    return (count === 1 ? word : word + 's');
}

// ------------------------------------------------------------------------------
// Public Interface
// ------------------------------------------------------------------------------

module.exports = function (results) {

    var output = '\n',
        total = 0,
        errors = 0,
        warnings = 0;

    results.forEach(function (result) {
        var messages = result.messages;

        if (messages.length === 0) {
            return;
        }

        total += messages.length;
        output += chalk.underline(result.filePath) + '\n\n';

        output += table(
            messages.map(function (message) {
                var messageType;

                if (message.fatal || message.severity === 2) {
                    messageType = chalk.red.bold(symbols['error']);
                    errors++;
                } else {
                    messageType = chalk.yellow.bold(symbols['warning']);
                    warnings++;
                }

                return [
                    '',
                    message.line || 0,
                    message.column || 0,
                    messageType,
                    message.message.replace(/\.$/, ''),
                    chalk.dim(message.ruleId || '')
                ];
            }),
            {
                align: ['', 'r', 'l', 'l'],
                stringLength: function (str) {
                    return chalk.stripColor(str).length;
                }
            }
        ).split('\n').map(function (el) {
            return el.replace(/(\d+)\s+(\d+)/, function (m, p1, p2) {
                return chalk.dim(p1 + ':' + p2);
            });
        }).join('\n') + '\n\n';
    });

    if (total > 0) {

        if (errors) {
            output += chalk.red.bold([' ', errors, pluralize(' error', errors), ' '].join(''));
        }

        if (warnings) {
            output += chalk.yellow.bold([' ', warnings, pluralize(' warning', warnings), ' '].join(''));
        }
        output += [' (', total, pluralize(' problem', total), ') \n'].join('');
    }

    return total > 0 ? output : '';
};
