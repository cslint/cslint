# CSLint

Code Style Lint, your another choice of code style `linter` and `formatter` for `js` and `css/scss`.

## Installation

```bash
$ [sudo] npm install cslint -g
```

## Configuration

Examples of cslint configuration file `.cslintrc`:

```bash
{
    eslint: {
        extends: "eslint-config-sm"
    },
    stylelint: {
        extends: "stylelint-config-sm"
    }
}
```

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
* it provides some build-in  `eslint-config-*`, `eslint-plugin-*`, `stylelint-config-*`,  which is very convenient for you to config them in `.cslintrc`
    * [eslint-config-google](https://www.npmjs.com/package/eslint-config-google)
    * [eslint-config-react](https://www.npmjs.com/package/eslint-config-react)
    * [eslint-config-sm (default)](https://www.npmjs.com/package/eslint-config-sm)
    * ~~[eslint-config-standard](https://www.npmjs.com/package/eslint-config-standard)~~
    * [eslint-plugin-promise](https://www.npmjs.com/package/eslint-plugin-promise)
    * [eslint-plugin-sm (default)](https://www.npmjs.com/package/eslint-plugin-sm)
    * ~~[eslint-plugin-standard](https://www.npmjs.com/package/eslint-plugin-standard)~~
    * [stylelint-config-sm (default)](https://www.npmjs.com/package/stylelint-config-sm)
    * ~~[stylelint-config-standard](https://www.npmjs.com/package/stylelint-config-standard)(later support)~~

## Inspired by

* [eslint](http://eslint.org)
* [stylelint](http://stylelint.io)
* [stylefmt](https://github.com/morishitter/stylefmt)
* [fecs](https://github.com/ecomfe/fecs)
* [canonical](https://github.com/gajus/canonical)