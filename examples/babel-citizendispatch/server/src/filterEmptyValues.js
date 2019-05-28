"use strict";

// Filters k-v pairs from an object where the value is '', null, or undefined.
// Required for DDB updates/puts
var filterEmptyValues = function filterEmptyValues(object) {
  return Object.entries(object).filter(function (el) {
    return el[1] !== '' && el[1] !== null && el[1] !== undefined;
  }).reduce(function (result, item, index, array) {
    result[item[0]] = item[1];
    return result;
  }, {});
};

module.exports = filterEmptyValues;