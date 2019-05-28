"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AWS = require('aws-sdk');

var uuid = require('uuid');

var dynamodbUpdateExpression = require('dynamodb-update-expression');

var dynamoDb; // For use with serverless-offline and dynamodb-local

if (process.env.IS_OFFLINE) {
  var credentials = new AWS.SharedIniFileCredentials({
    profile: 'personal'
  });
  AWS.config.credentials = credentials;
  AWS.config.region = 'us-east-1';
}

if (process.env.STAGE === 'local') {
  console.log("Using dynamodb-local");
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  });
} else {
  console.log("Using dynamodb within AWS");
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

var tableFor = function tableFor(tableName) {
  return "citizen-dispatch-dev-" + tableName;
}; // exports.call = (action, params) => {
//     dynamoDb[action](params);
// }


exports.put = function (params) {
  dynamoDb.put(params);
};

exports.update = function (params) {
  dynamoDb.update(params);
};

exports.upsert = function (tableName, keyName, keyValue, fields) {
  var params = Object.assign({
    TableName: tableFor(tableName),
    Key: _defineProperty({}, keyName, keyValue || uuid.v1()),
    // Generate a new id (create a record) if non-existent
    ReturnValues: 'ALL_NEW'
  }, dynamodbUpdateExpression.getUpdateExpression({}, fields));
  console.log('Upsert Params', params);
  return dynamoDb.update(params).then(function (result) {
    return result.Attributes;
  });
};

exports.removeAttributes = function (tableName, keyName, keyValue, fields) {
  var params = Object.assign({
    TableName: tableFor(tableName),
    Key: _defineProperty({}, keyName, keyValue),
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'REMOVE ' + fields.join(', ')
  });
  console.log('RemoveAttributes params', params);
  return dynamoDb.update(params).then(function (result) {
    return result.Attributes;
  });
};

exports.getOne = function (tableName, keyObject) {
  var params = {
    TableName: tableFor(tableName),
    Key: keyObject // ie { 'id': id }

  };
  return dynamoDb.get(params).then(function (result) {
    return result.Item;
  });
};

exports.getAll = function (tableName) {
  var params = {
    TableName: tableFor(tableName),
    Select: "ALL_ATTRIBUTES"
  };
  return dynamoDb.scan(params).then(function (result) {
    return result.Items;
  });
};

exports["delete"] = function (tableName, keyObject) {
  var params = {
    TableName: tableFor(tableName),
    Key: keyObject // ie { 'id': id }

  };
  return dynamoDb["delete"](params);
};