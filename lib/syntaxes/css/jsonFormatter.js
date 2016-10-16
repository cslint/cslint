'use strict';

var _ = require('lodash');

var total = 0;

function formatter(messages, source) {
    var output = {},
        fmtMsgs = [],
        orderedMessages = [];

    if (!messages.length) return '';

    if (source) {
        output.filePath = source;
    }

    orderedMessages = _.sortBy(messages, ['line', 'column']);

    fmtMsgs = orderedMessages.map(function (msg) {
        var severity = msg.severity;

        if (severity == 'error') {
            severity = 2;
        } else if (severity == 'warning') {
            severity = 1;
        }

        return {
            ruleId: msg.rule,
            line: msg.line,
            column: msg.column,
            severity: severity,
            message: msg.text.replace(/[\x01-\x1A]+/g, ' ').replace(/\.$/, '').replace(new RegExp(_.escapeRegExp('(' + msg.rule + ')') + '$'), '').trim()
        };
    });

    output.messages = fmtMsgs;

    return output;
}

module.exports = function (results) {

    var output = [];

    output = results.map(function (result) {

        total += result.warnings.length;

        return formatter(result.warnings, result.source);
    });

    // keep the output properties consistent with eslint
    return total > 0 ? JSON.stringify(output) : '';
};
