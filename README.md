# CSLint

Code Style Lint, your another choice of code style `linter` and `formatter` for `js` and `css/scss`.

## Installation

```bash
$ [sudo] npm install cslint -g
```

## Configuration

`.cslintrc` has been deprecated, you can keep your configuration and ignore files (e.g. `.eslintrc`, `.eslintignore` for ESLint, and `.stylelintrc`, `.stylelintignore` for Stylelint). you can do what you want do with rules.

## Usage

```
# show help info
$ cslint -h

# lint file
$ cslint foo.js

# lint scss
$ cslint . --ext scss

# fix file
$ cslint foo.js --fix
```

## Integrations

* Sublime Text 3:
    * [sublime-cslint](https://github.com/cslint/sublime-cslint)


## Why

* if you are familiar with `eslint` and `stylelint`,  there is no difficulty to use `cslint` which will do what `eslint` and `stylelint` will do.
* you don't have to pay close attention to the upgrade of `eslint` and `stylelint` and their configs and plugins, cslint will do that for you.
* you don't have to `npm install` a lot of pkgs everytime one by one, cslint will do that for you since you start use it.
* it provides some build-in  `eslint-config-*`, `eslint-plugin-*`, `stylelint-config-*`
    * [eslint-config-sm (default)](https://www.npmjs.com/package/eslint-config-sm)
    * [eslint-plugin-sm (default)](https://www.npmjs.com/package/eslint-plugin-sm)
    * [stylelint-config-sm (default)](https://www.npmjs.com/package/stylelint-config-sm)

## Inspired by

* [eslint](http://eslint.org)
* [stylelint](http://stylelint.io)
* [stylefmt](https://github.com/morishitter/stylefmt)
* [fecs](https://github.com/ecomfe/fecs)
* [canonical](https://github.com/gajus/canonical)