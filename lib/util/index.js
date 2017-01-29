var path = require('path');

exports.isCssLike = function(filePath) {
    return /^\.css|\.scss$/i.test(path.extname(filePath));
}
exports.isJsLike = function(filePath) {
    return /^\.js$/i.test(path.extname(filePath));
}