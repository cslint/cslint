
"use strict";

var optionator = require("optionator");

module.exports = optionator({
    prepend: 'Usage: cslint [options] file.js [file.js] [dir]',
    defaults: {
        concatRepeatedArrays: true,
        mergeRepeatedObjects: true
    },
    options: [{
        option: "help",
        alias: "h",
        type: "Boolean",
        description: "Show help"
    },
    {
        option: "version",
        alias: "v",
        type: "Boolean",
        description: "Output the version number"
    },
    {
        option: "fix",
        type: "Boolean",
        default: false,
        description: "Automatically fix problems"
    },
    {
        option: "ext",
        type: "[String]",
        default: "",
        description: "Specify file extensions, js|css|scss"
    }]
});