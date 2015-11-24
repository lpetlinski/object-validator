"use strict";


// all functions should return string if there is error, and false otherwise.
exports.required = function(data, required) {
    var errorString = "is required.";
    if(!data) {
        return errorString;
    }
    return false;
}

exports.match = function(data, matcher) {
    var errorString = "did not match required expression.";
    if(!data || (typeof data !== "string")) {
        return false;
    }
    if(!data.match(matcher)) {
        return errorString;
    }
    return false;
}

exports.sameAs = function(data, fieldToCheck, obj) {
    var errorString = "is not same as " + fieldToCheck;
    if(!data) {
        return false;
    }
    if(!obj || !obj.hasOwnProperty(fieldToCheck) || data !== obj[fieldToCheck]) {
        return errorString;
    }
    return false;
}

exports.minLength = function(data, min) {
    var errorString = "has length less than minimal " + min + " chars";
    if(!data || !(typeof data === "string") || data.length >= min) {
        return false;
    }
    return errorString;
}

exports.maxLength = function(data, max) {
    var errorString = "has length greater than maximal " + max + " chars";
    if(!data || !(typeof data === "string") || data.length <= min) {
        return false;
    }
    return errorString;
}