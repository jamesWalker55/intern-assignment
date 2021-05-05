const util = {
    isString: function (x) {
        return Object.prototype.toString.call(x) === "[object String]";
    },
}

module.exports = util;
