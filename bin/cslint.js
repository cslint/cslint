#!/usr/bin/env node

'use strict';

var cli = require('../lib/cli');

process.on('uncaughtException', function (reason, p) {
    console.log('uncaughtException', reason, p);
    process.exit(1);
});

process.exitCode = cli.execute(process.argv) || 1;
