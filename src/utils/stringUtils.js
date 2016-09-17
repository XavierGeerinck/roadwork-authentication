var crypto = require('crypto');

exports.replaceAll = function (str, search, replacement) {
    return str.replace(new RegExp(search, 'g'), replacement);
};

/**
 * @description
 * Converts a lowerCamelCase string to an underscore lowercase separated one
 *
 * @example
 * lowerCamelCase --> lower_camel_case
 *
 * @param string
 */
exports.convertLowerCamelCaseToUnderScoreLowerCase = function (str) {
    return str.replace(new RegExp('([A-Z])', 'g'), "_$1").toLowerCase();
};

/**
 * @description
 * Converts a string to ascii characters if they are not supported
 * @param str
 * @returns {*}
 */
exports.toAscii = function (str) {
    var source = 'ŠŒŽšœžŸ¥µÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýÿ';
    var target = 'SOZsozYYuAAAAAAACEEEEIIIIDNOOOOOOUUUUYsaaaaaaaceeeeiiiionoooooouuuuyy';
    var i = 0;

    do {
        str= str.replace(new RegExp(source.charAt(i), 'g'), target.charAt(i));
        i++;
    }
    while (i < source.length);

    return str;
};

exports.generateRandomString = function (length, hasLowerCase, hasUpperCase, hasNumbers, hasSpecial) {
    length = length || 10;
    hasLowerCase = hasLowerCase || true;
    hasUpperCase = hasUpperCase || false;
    hasNumbers = hasNumbers || true;
    hasSpecial = hasSpecial || false;

    var lowercase = "abcdefhijklmnopqrstuvwxyz";
    var uppercase = "ABCDEFHIJKLMNOPQRSTUVWXYZ";
    var numbers = "0123456789";
    var special = "!@#$%^&*()_-{[}]|:;<,>.?/'";

    var chars = "";

    if (hasLowerCase) {
        chars += lowercase;
    }

    if (hasUpperCase) {
        chars += uppercase;
    }

    if (hasNumbers) {
        chars += numbers;
    }

    if (hasSpecial) {
        chars += special;
    }

    // Generate string
    var generated = "";

    for (var i = 0; i < length; i++) {
        var randIndex = Math.floor(Math.random() * chars.length); // Idx 0 - chars.length
        generated += chars[randIndex];
    }

    return generated;
};


/**
 * Creates a unique token used to identify the user it's session
 * @return {string}
 */
exports.createBearerToken = function () {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};
