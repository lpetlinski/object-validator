"use strict";

exports.endsWith = function(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

exports.removeSuffix = function(str, suffix) {
	return str.substr(0, str.length - suffix.length);
}

exports.isArray = function(obj) {
	if(Array.isArray) {
		return Array.isArray(obj);
	}
	return Object.prototype.toString.call(obj) === Object.prototype.toString.call([]); 
}