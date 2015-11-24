"use strict";

var ValidationFunctions = require("./ValidationFunctions"),
    Utils = require("./ValidationUtils");

var OPTIONAL_RULE = "optional";
var REQUIRED_RULE = "required";
var ARRAY_OBJECTS_SUFFIX = "[]";
var SIMPLE_ARRAY_SUFFIX = "[v]";
var OBJECT_SUFFIX = "{}";
var INDEX_BY_ARRAY = "__indexBy__";

var _validationFunctions = ValidationFunctions;

function processRules(obj, validationRules) {
    if(!validationRules) {
        throw new Error("Validation file name is required");
    }
    if(!obj) {
        throw new Error("Validation object is required");
    }
    return innerProcess(obj, validationRules);
}

function innerProcess(obj, validationRules) {
    var errors = false;
    for(var field in validationRules) {
        if(field !== INDEX_BY_ARRAY && validationRules.hasOwnProperty(field)) {
            var result = processFieldValidation(obj, field, validationRules[field]);
            if(result !== false) {
                if(errors === false) {
                    errors = {};
                }
                errors[field] = result;
            }
        }
    }
    return errors;
}

function processFieldValidation(obj, field, fieldValidationRules) {
    if(Utils.endsWith(field, ARRAY_OBJECTS_SUFFIX)) {
        var fieldName = Utils.removeSuffix(field, ARRAY_OBJECTS_SUFFIX);
        return validateArrayOfObjects(obj, fieldName, fieldValidationRules);
    } else if(Utils.endsWith(field, SIMPLE_ARRAY_SUFFIX)) {
        var fieldName = Utils.removeSuffix(field, SIMPLE_ARRAY_SUFFIX);
        return validateArrayOfValues(obj, fieldName, fieldValidationRules);

    } else if(Utils.endsWith(field, OBJECT_SUFFIX)) {
        var fieldName = Utils.removeSuffix(field, OBJECT_SUFFIX);
        return validateObject(obj, fieldName, fieldValidationRules);

    } else {
        return validateField(obj, field, fieldValidationRules);
    }
}

function validateArrayOfObjects(obj, arrayName, fieldValidationRules) {
    if(obj.hasOwnProperty(arrayName)) {
        var arrayValue = obj[arrayName];
        var errorResult = false;
        for(var key in arrayValue) {
            var value = arrayValue[key];
            var result = innerProcess(value, fieldValidationRules);
            if(result) {
                var index = getArrayErrorIndex(key, value, fieldValidationRules);
                if(errorResult === false) {
                    errorResult = {};
                }
                errorResult[index] = result;
            }
        }
        return errorResult;
    } else if(!fieldValidationRules.hasOwnProperty("__" + OPTIONAL_RULE)) {
        return addRequiredError(arrayName);
    }
    return false;
}

function getArrayErrorIndex(key, value, fieldValidationRules) {
    var index = key;
    if(fieldValidationRules.hasOwnProperty(INDEX_BY_ARRAY)) {
        var indexByProp = fieldValidationRules[INDEX_BY_ARRAY];
        if(value.hasOwnProperty(indexByProp)) {
            index = value[indexByProp];
        }
    }
    return index;
}

function validateArrayOfValues(obj, arrayName, fieldValidationRules) {
    if(obj.hasOwnProperty(arrayName)) {
        var arrayValue = obj[arrayName];
        var errorResult = false;
        for(var key in arrayValue) {
            var value = arrayValue[key];
            var result = validateFieldValue(obj, value, fieldValidationRules);
            if(result !== false) {
                var index = getArrayErrorIndex(key, value, fieldValidationRules);
                if(errorResult === false) {
                    errorResult = {};
                }
                errorResult[index] = result;
            }
        }
        return errorResult;
    } else if(!fieldValidationRules.hasOwnProperty("__" + OPTIONAL_RULE)) {
        return addRequiredError(arrayName);
    }
    return false;
}

function validateObject(obj, objectName, fieldValidationRules) {
    if(obj.hasOwnProperty(objectName)) {
        var objectValue = obj[objectName];
        var result = innerProcess(objectValue, fieldValidationRules);
        if(result) {
            return result;
        }
    } else if(!fieldValidationRules.hasOwnProperty("__" + OPTIONAL_RULE)) {
        return addRequiredError(objectName);
    }
    return false;
}

function validateField(obj, field, fieldValidationRules) {
    if(obj.hasOwnProperty(field)) {
        var fieldValue = obj[field];
        return validateFieldValue(obj, fieldValue, fieldValidationRules);
    } else if(!fieldValidationRules.hasOwnProperty(OPTIONAL_RULE)) {
        return addRequiredError(field);
    }
    return false;
}

function validateFieldValue(obj, fieldValue, fieldValidationRules) {
    if(fieldValidationRules.hasOwnProperty(REQUIRED_RULE)) {
        var ruleValue = fieldValidationRules[REQUIRED_RULE];
        var result = validateRule(obj, fieldValue, REQUIRED_RULE, ruleValue);
        if(result !== false) {
            return result;
        }
    }
    for(var ruleName in fieldValidationRules) {
        if(ruleName !== INDEX_BY_ARRAY && fieldValidationRules.hasOwnProperty(ruleName)) {
            var ruleValue = fieldValidationRules[ruleName];
            var result = validateRule(obj, fieldValue, ruleName, ruleValue);
            if(result !== false) {
                return result;
            }
        }
    }
    return false;
}

function validateRule(obj, fieldValue, ruleName, ruleValue) {
    var ruleParam = ruleValue;
    var ruleError = null;
    if(Utils.isArray(ruleValue)) {
        ruleParam = ruleValue[0];
        ruleError = ruleValue[1];
    }
    var result = _validationFunctions[ruleName](fieldValue, ruleParam, obj);
    if(result !== false && ruleError) {
        return ruleError;
    }
    return result;
}

function addRequiredError() {
    return _validationFunctions[REQUIRED_RULE](false, true);
}


var Validator = {

    process: function(obj, validationRules) {
        return processRules(obj, validationRules);
    },

    processField: function(value, fieldName, validationRules) {
        var fieldArray = fieldName.split(".");
        if(fieldArray.length < 1) {
            throw new Error("Empty field name.");
        }
        var rules = validationRules;
        for(var i = 0; i<fieldArray.length; i++) {
            var subfield = fieldArray[i];
            if(rules.hasOwnProperty(subfield)) {
                rules = rules[subfield];
            } else if(rules.hasOwnProperty(subfield + ARRAY_OBJECTS_SUFFIX)) {
                rules = rules[subfield + ARRAY_OBJECTS_SUFFIX];
            } else if(rules.hasOwnProperty(subfield + SIMPLE_ARRAY_SUFFIX)) {
                rules = rules[subfield + SIMPLE_ARRAY_SUFFIX];
            } else if(rules.hasOwnProperty(subfield + OBJECT_SUFFIX)) {
                rules = rules[subfield + OBJECT_SUFFIX];
            } else {
                throw new Error("Invalid field name. No field " + subfield + " in " + fieldName);
            }
        }
        return validateFieldValue(null, value, rules);
    },

    addValidator: function(ruleName, callback) {
        _validationFunctions[ruleName] = callback;
    }
}


module.exports = Validator;