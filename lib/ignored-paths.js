/*
 * This code is taken from eslint repo
 * (https://github.com/eslint/eslint)
 */
/**
 * @fileoverview Responsible for loading ignore config files and managing ignore patterns
 * @author Jonathan Rajavuori
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

var fs = require('fs'),
    path = require('path'),
    ignore = require('ignore'),
    shell = require('shelljs'),
    pathUtil = require('eslint/lib/util/path-util');

// ------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------

var ESLINT_IGNORE_FILENAME = '.cslintignore';

/**
 * Adds `"*"` at the end of `"node_modules/"`,
 * so that subtle directories could be re-included by .gitignore patterns
 * such as `"!node_modules/should_not_ignored"`
 */
var DEFAULT_IGNORE_DIRS = [
    '/node_modules/*',
    '/bower_components/*'
];
var DEFAULT_OPTIONS = {
    dotfiles: false,
    cwd: process.cwd()
};

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

/**
 * Find an ignore file in the current directory.
 * @param {string} cwd Current working directory
 * @returns {string} Path of ignore file or an empty string.
 */
function findIgnoreFile(cwd) {
    cwd = cwd || DEFAULT_OPTIONS.cwd;

    var ignoreFilePath = path.resolve(cwd, ESLINT_IGNORE_FILENAME);

    return shell.test('-f', ignoreFilePath) ? ignoreFilePath : '';
}

/**
 * Merge options with defaults
 * @param {Object} options Options to merge with DEFAULT_OPTIONS varant
 * @returns {Object} Merged options
 */
function mergeDefaultOptions(options) {
    options = options || {};
    return Object.assign({}, DEFAULT_OPTIONS, options);
}

// ------------------------------------------------------------------------------
// Public Interface
// ------------------------------------------------------------------------------

/**
 * IgnoredPaths
 * @varructor
 * @class IgnoredPaths
 * @param {Object} options object containing 'ignore', 'ignorePath' and 'patterns' properties
 */
function IgnoredPaths(options) {

    options = mergeDefaultOptions(options);

    /**
     * add pattern to node-ignore instance
     * @param {Object} ig, instance of node-ignore
     * @param {string} pattern, pattern do add to ig
     * @returns {array} raw ignore rules
     */
    function addPattern(ig, pattern) {
        return ig.addPattern(pattern);
    }

    /**
     * add ignore file to node-ignore instance
     * @param {Object} ig, instance of node-ignore
     * @param {string} filepath, file to add to ig
     * @returns {array} raw ignore rules
     */
    function addIgnoreFile(ig, filepath) {
        ig.ignoreFiles.push(filepath);
        return ig.add(fs.readFileSync(filepath, 'utf8'));
    }

    this.defaultPatterns = [].concat(DEFAULT_IGNORE_DIRS, options.patterns || []);
    this.baseDir = options.cwd;

    this.ig = {
        custom: ignore(),
        'default': ignore()
    };

    // Add a way to keep track of ignored files.  This was present in node-ignore
    // 2.x, but dropped for now as of 3.0.10.
    this.ig.custom.ignoreFiles = [];
    this.ig.default.ignoreFiles = [];

    if (options.dotfiles !== true) {

        /*
         * ignore files beginning with a dot, but not files in a parent or
         * ancestor directory (which in relative format will begin with `../`).
         */
        addPattern(this.ig.default, ['.*', '!../']);
    }

    addPattern(this.ig.default, this.defaultPatterns);

    if (options.ignore !== false) {
        var ignorePath;

        if (options.ignorePath) {

            try {
                fs.statSync(options.ignorePath);
                ignorePath = options.ignorePath;
            } catch (e) {
                e.message = 'Cannot read ignore file: ' + options.ignorePath + '\nError: ' + e.message;
                throw e;
            }
        } else {
            ignorePath = findIgnoreFile(options.cwd);

            try {
                fs.statSync(ignorePath);
            } catch (e) {
                this.options = options;
            }
        }

        if (ignorePath) {
            this.baseDir = path.dirname(path.resolve(options.cwd, ignorePath));
            addIgnoreFile(this.ig.custom, ignorePath);
            addIgnoreFile(this.ig.default, ignorePath);
        }

        if (options.ignorePattern) {
            addPattern(this.ig.custom, options.ignorePattern);
            addPattern(this.ig.default, options.ignorePattern);
        }
    }

    this.options = options;

}

/**
 * Determine whether a file path is included in the default or custom ignore patterns
 * @param {string} filepath Path to check
 * @param {string} [category=null] check 'default', 'custom' or both (null)
 * @returns {boolean} true if the file path matches one or more patterns, false otherwise
 */
IgnoredPaths.prototype.contains = function (filepath, category) {

    var result = false;
    var absolutePath = path.resolve(this.options.cwd, filepath);
    var relativePath = pathUtil.getRelativePath(absolutePath, this.options.cwd);

    if (typeof category === 'undefined' || category === 'default') {
        result = result || this.ig.default.filter([relativePath]).length === 0;
    }

    if (typeof category === 'undefined' || category === 'custom') {
        result = result || this.ig.custom.filter([relativePath]).length === 0;
    }

    return result;

};

/**
 * Returns a list of dir patterns for glob to ignore
 * @returns {function()} method to check whether a folder should be ignored by glob.
 */
IgnoredPaths.prototype.getIgnoredFoldersGlobChecker = function () {

    var ig = ignore().add(DEFAULT_IGNORE_DIRS);

    if (this.options.ignore) {
        ig.add(this.ig.custom);
    }

    var filter = ig.createFilter();

    /**
     * TODO
     * 1.
     * Actually, it should be `this.options.baseDir`, which is the base dir of `ignore-path`,
     * as well as Line 177.
     * But doing this leads to a breaking change and fails tests.
     * Related to #6759
     */
    var base = this.options.cwd;

    return function (absolutePath) {
        var relative = pathUtil.getRelativePath(absolutePath, base);

        if (!relative) {
            return false;
        }

        return !filter(relative);
    };
};

module.exports = IgnoredPaths;
