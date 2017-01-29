var JsProcessor = require('./lib/syntaxes/js');
var CssProcessor = require('./lib/syntaxes/css');


function lintFiles(files, options) {
    var fn = 'lintFiles';

    options = Object.assign(options||{}, {format: 'json'});

    new JsProcessor(options)[fn](files).then(done, fail);
    new CssProcessor(options)[fn](files).then(done, fail);

    function done(results) {
        console.log(results);
    }

    function fail(err) {
        console.track(err);
    }
}


module.exports = lintFiles;