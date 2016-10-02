
'use strict';

var fs = require('fs');
var path = require('path');
var stripBom = require('strip-bom');
var stripComments = require('strip-json-comments');
var shell = require('shelljs');
var yaml = require('js-yaml');
var merge = require('deepmerge');

var CONFIG_FILE = '.cslintrc';

function ConfigHelper() {
    this.cache = {};
    this.searchedDirs = {};
    this.cwd = process.cwd();
}
/**
 * get .cslintrc configuration from filePath
 * @param  {String} filePath start path to look for a config
 * @return {Object} configuration object
 */
ConfigHelper.prototype.getConfig = function (filePath) {

    var directory, config, files;

    if (filePath) {
        if (shell.test('-f', filePath)) {
            directory = path.dirname(filePath);
        }
        if (shell.test('-d', filePath)) {
            directory = filePath;
        }
    }

    directory = directory || this.cwd;

    config = this.cache[directory];

    if (config) {
        log('from cached config');
        return config;
    }

    files = this.getConfigFilesInDirs(directory);

    if (files.length) {
        files.forEach(function (file) {
            config = merge(loadConfig(file), config || {});
        });
    }
    
    if (config && Object.keys(config).length) {
        this.cache[directory] = config;
    }

    return config || {};

};

/**
 * get configuration from directory and parent directories
 * @param  {String} directory current directory path
 * @return {Object} configuration object
 */
ConfigHelper.prototype.getConfigFilesInDirs = function (directory) {

    var filePath,
        dirs = [],
        searched = 0;

    if (this.searchedDirs[directory]) {
        return this.searchedDirs[directory];
    }

    while (true) {
        dirs[searched++] = directory;
        this.searchedDirs[directory] = [];

        filePath = findFile(directory);

        if (filePath) {
            for (var i = 0; i < searched; i++) {
                this.searchedDirs[dirs[i]].push(filePath);
            }
        }

        var childDir = directory;

        directory = path.dirname(directory);

        if (directory == childDir) {
            return this.searchedDirs[dirs[0]];
            break;
        }
    }
};

/**
 * load config from .cslintrc
 * @param  {String} filePath the filename to load
 * @returns {Object} The configuration object from the file.
 */
function loadConfig(filePath) {

    var file = stripBom(fs.readFileSync(filePath, 'utf8'));

    try {
        return yaml.safeLoad(stripComments(file)) || {};
    } catch (e) {
        throw e;
    }
}

/**
 * get .cslintrc path from directory and parent directories
 * @param  {String} directory current directory path
 * @return {String} .cslintrc path
 */
function findFile(directory) {

    var stats, filePath;

    try {
        stats = fs.statSync(directory);
    } catch (e) {
        console.log(e);
    }

    if (stats.isDirectory()) {
        fs.readdirSync(directory).forEach(function (file) {
            if (file == CONFIG_FILE) {

                var resolved = path.resolve(directory, file);

                if (fs.statSync(resolved).isFile()) {
                    filePath = resolved;
                }
            }
        });
    }

    return filePath || '';
}

module.exports = ConfigHelper;
