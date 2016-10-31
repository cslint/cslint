'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var table = require('table');
var symbols = require('log-symbols');

var total = 0, errors = 0, warnings = 0, summaryColor = 'yellow';

function pluralize(word, count) {
    return (count === 1 ? word : word + 's');
}

function drawTable(messages) {
    var rows = [],
        orderedMessages = [];

    if (!messages.length) {
        return '';
    }

    orderedMessages = _.sortBy(messages, ['line', 'column']);

    rows = orderedMessages.map(function (message) {
        var severity = message.severity;
        var messageType;

        if (severity == 'error') {
            messageType = chalk.red.bold(symbols[severity]);
            errors++;
        } else if (severity == 'warning') {
            messageType = chalk.yellow.bold(symbols[severity]);
            warnings++;
        }

        var row = [
            message.line || '',
            message.column || '',
            messageType,
            message.text
                    .replace(/[\x01-\x1A]+/g, ' ').replace(/\.$/, '')
                    .replace(new RegExp(_.escapeRegExp('(' + message.rule + ')') + '$'), ''),
            chalk.gray(message.rule || ''),
        ];

        return row;
    });

    return table.default(rows, {
        border: table.getBorderCharacters('void'),
        columns: {
            '0': {alignment: 'right'},
            '1': {alignment: 'left'},
            '2': {alignment: 'center'},
            '3': {alignment: 'left'},
            '4': {alignment: 'left'},
        },
        drawHorizontalLine: function () { return false; }
    }).split('\n').map(function (el) {
        return el.replace(/(\d+)\s+(\d+)/, function (m, p1, p2) {
            return chalk.gray(p1 + ':' + p2);
        });
    }).join('\n');

}

function formatter(messages, source) {

    if (!messages.length) return '';

    var output = '\n';

    if (source) {
        output += chalk.underline(source) + '\n\n';
    }

    output += drawTable(messages);

    return output;
}

module.exports = function (results) {
    var output = '';

    output = results.reduce(function (curr, result) {

        total += result.warnings.length;

        return curr + formatter(result.warnings, result.source);

    }, output);

    output = output.trim();

    if (output !== '') {
        output = '\n' + output + '\n\n';
    }

    if (total > 0) {

        if (errors) {
            output += chalk.red.bold([errors, pluralize(' error', errors), ' '].join(''));
        }

        if (warnings) {
            output += chalk.yellow.bold([warnings, pluralize(' warning', warnings), ' '].join(''));
        }
        output += [total, pluralize(' problem', total),'\n'].join('');
    }


    return total > 0 ? output : '';
};
