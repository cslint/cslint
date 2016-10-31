'use strict';

module.exports = function(results) {

    results.forEach(function (result) {
        var messages = result.messages;

        messages.forEach(function (message) {
            message['from'] = message.ruleId.indexOf('/') == -1 ? 'eslint': 'plugin';// for IDE
        });
    });

    return JSON.stringify(results);
};
