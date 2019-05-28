"use strict";

//
// DDB
// 
var AWS = require('aws-sdk');

var update = require('update-immutable')["default"];

var uuid = require('uuid');

var filterEmptyValues = require('./filterEmptyValues');

var dynamodbUpdateExpression = require('dynamodb-update-expression');

var geolib = require('geolib'); // The new, better way to make ddb requests (instead of promisify)


var dynamoDbLib = require('./dynamoDbLib');

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
  console.log("Using dynamodb on AWS");
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

var tableFor = function tableFor(tableName) {
  return "citizen-dispatch-dev-" + tableName;
};

var promisify = function promisify(foo) {
  return new Promise(function (resolve, reject) {
    foo(function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}; //
// SYSTEM INFORMATION
//


exports.getSystemInformation = function () {
  var queryFields = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var response = {};

  if ('requestEpicenter' in queryFields) {
    var requests = exports.getRequests();

    if (!requests || requests.length === 0) {
      response.requestEpicenter = {
        latitude: 5,
        longitude: 34,
        timestamp: Date.now()
      };
    } else {
      response.requestEpicenter = geolib.getCenter(requests);
      response.requestEpicenter.timestamp = Date.now();
    }

    return response;
  }
}; // 
// REQUESTS
//


exports.getRequest = function (_ref) {
  var id = _ref.id;
  var queryFields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return dynamoDbLib.getOne('requests', {
    'id': id
  }).then(function (record) {
    var newRecord = Object.assign({}, record);

    if ('team' in queryFields) {
      if (record.teamId) {
        newRecord.team = exports.getTeam({
          id: record.teamId
        }, queryFields.team);
      } else {
        newRecord.team = null;
      }
    }

    if ('dispatch' in queryFields) {
      if (record.dispatchId) {
        newRecord.dispatch = exports.getDispatch({
          id: record.dispatchId
        }, queryFields.dispatch);
      } else {
        newRecord.dispatch = null;
      }
    }

    if ('user' in queryFields) {
      if (record.userId) {
        newRecord.user = exports.getDispatch({
          id: record.userId
        }, queryFields.user);
      } else {
        newRecord.user = null;
      }
    }

    console.log('Returning request record:', newRecord);
    return newRecord;
  });
};

exports.createRequest = function (_ref2) {
  var request = _ref2.request;
  console.log("Creating request:", request);
  var newRequest = update(request, {
    id: {
      $set: uuid.v1()
    },
    createdAt: {
      $set: Date.now()
    }
  });
  return promisify(function (callback) {
    return dynamoDb.put({
      TableName: tableFor('requests'),
      Item: filterEmptyValues(newRequest)
    }, callback);
  }).then(function () {
    return exports.getRequest(newRequest);
  })["catch"](function (err) {
    return console.log(err);
  });
};

exports.assignRequest = function (_ref3) {
  var requestId = _ref3.requestId,
      teamId = _ref3.teamId,
      dispatchId = _ref3.dispatchId;
  dynamoDbLib.upsert('requests', 'id', requestId, {
    teamId: teamId,
    dispatchId: dispatchId
  }); // dynamoDbLib.removeAttributes('requests', 'id', requestId, ['teamId'])
};

exports.updateRequestStatus = function (_ref4) {
  var requestId = _ref4.requestId,
      status = _ref4.status;
  return dynamoDbLib.upsert('requests', 'id', requestId, {
    status: status
  });
}; // 
// USERS
// 


exports.getUser = function (_ref5) {
  var id = _ref5.id;
  var queryFields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return dynamoDbLib.getOne('users', {
    id: id
  }).then(function (item) {
    if (!item) return item; // Retrieve & append dispatch and team records if queried, passing the nested query fields

    var newItem = Object.assign({}, item);

    if ('dispatch' in queryFields && item.dispatchId) {
      newItem.dispatch = exports.getDispatch({
        id: item.dispatchId
      }, queryFields.dispatch);
    }

    if ('team' in queryFields && item.teamId) {
      newItem.team = exports.getTeam({
        id: item.teamId
      }, queryFields.team);
    } // TODO: fix the repeated query to the location table here


    if ('locationHistory' in queryFields) newItem.locationHistory = exports.getUserLocationHistory({
      id: item.id
    });
    if ('location' in queryFields) newItem.location = exports.getUserLocation({
      id: item.id
    });
    return newItem;
  });
}; // exports.getUser = async ({ id }) => {
//   const locationHistory = await exports.getUserLocationHistory({ id })
// }


exports.getUserLocationHistory = function (_ref6) {
  var id = _ref6.id;
  console.log("Location history for id", id);
  var params = {
    TableName: 'citizen-dispatch-dev-userLocations',
    KeyConditionExpression: '#id = :id',
    ExpressionAttributeValues: {
      ':id': id
    },
    ExpressionAttributeNames: {
      '#id': "id"
    },
    Select: 'ALL_ATTRIBUTES'
  };
  return dynamoDbLib.query(params).then(function (result) {
    return result.Items;
  });
};

exports.getUserLocation = function (_ref7) {
  var id = _ref7.id;
  return exports.getUserLocationHistory({
    id: id
  }).then(function (locations) {
    return locations[locations.length - 1];
  });
}; // Non-standard upsert


exports.upsertUser = function (_ref8) {
  var id = _ref8.id,
      fields = _ref8.fields;
  var params = Object.assign({
    TableName: tableFor('users'),
    Key: {
      id: id
    },
    // It will always have an id since it's generated by cognito
    ReturnValues: 'ALL_NEW'
  }, dynamodbUpdateExpression.getUpdateExpression({}, fields));
  return dynamoDbLib.update(params).then(function (result) {
    return result.Attributes;
  });
};

exports.assignUser = function (_ref9) {
  var userId = _ref9.userId,
      teamId = _ref9.teamId,
      dispatchId = _ref9.dispatchId;
  dynamoDbLib.upsert('users', 'id', userId, {
    teamId: teamId,
    dispatchId: dispatchId
  });
}; // 
// STANDARD GETS
//
// TODO: fetch extra query fields


exports.getDispatch = function (_ref10) {
  var id = _ref10.id;
  return dynamoDbLib.getOne('dispatches', {
    id: id
  });
};

exports.getTeam = function (_ref11, queryFields) {
  var id = _ref11.id;
  return dynamoDbLib.getOne('teams', {
    id: id
  }).then(function (record) {
    if (!record) return record; // Retrieve & append dispatch and team records if queried, passing the nested query fields

    var newRecord = Object.assign({}, record);

    if ('dispatch' in queryFields && record.dispatchId) {
      newRecord.dispatch = exports.getDispatch({
        id: record.dispatchId
      }, queryFields.dispatch);
    }

    return newRecord;
  });
};

exports.getRequests = function () {
  var queryFields = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return dynamoDbLib.getAll('requests').then(function (records) {
    console.log("queryfields", queryFields);
    if (!records) return records;
    var newRecords = Promise.all(records.map(function (record) {
      var result = Promise.resolve(record);

      if ('team' in queryFields && record.teamId) {
        result = result.then(function (record) {
          return exports.getTeam({
            id: record.teamId
          }, queryFields.team).then(function (team) {
            return Object.assign({}, record, {
              team: team
            });
          });
        });
      }

      if ('dispatch' in queryFields && record.dispatchId) {
        result = result.then(function (record) {
          return exports.getDispatch({
            id: record.dispatchId
          }, queryFields.dispatch).then(function (dispatch) {
            return Object.assign({}, record, {
              dispatch: dispatch
            });
          });
        });
      }

      if ('user' in queryFields && record.userId) {
        result = result.then(function (record) {
          return exports.getUser({
            id: record.userId
          }, queryFields.user).then(function (user) {
            return Object.assign({}, record, {
              user: user
            });
          });
        });
      }

      return result;
    }));
    return newRecords;
  });
};

exports.getDispatches = function () {
  return dynamoDbLib.getAll('dispatches');
};

exports.getTeams = function () {
  var queryFields = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return dynamoDbLib.getAll('teams').then(function (records) {
    if (!records) return records;
    var newRecords = records.slice();

    if ('leader' in queryFields) {
      newRecords = newRecords.map(function (record) {
        if (record.leaderId) {
          var leader = exports.getUser({
            id: record.leaderId
          }, queryFields.leader);
          return Object.assign({}, record, {
            leader: leader
          });
        } else {
          return record;
        }
      });
    }

    return newRecords;
  });
}; //
// STANDARD UPSERTS
//


exports.upsertRequest = function (_ref12) {
  var id = _ref12.id,
      fields = _ref12.fields;
  return dynamoDbLib.upsert('requests', 'id', id, fields);
};

exports.upsertDispatch = function (_ref13) {
  var id = _ref13.id,
      fields = _ref13.fields;
  return dynamoDbLib.upsert('dispatches', 'id', id, fields);
};

exports.upsertTeam = function (_ref14) {
  var id = _ref14.id,
      fields = _ref14.fields;
  return dynamoDbLib.upsert('teams', 'id', id, fields);
};