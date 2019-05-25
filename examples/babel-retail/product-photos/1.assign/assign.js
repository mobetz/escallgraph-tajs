'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var aws = require('aws-sdk'); // eslint-disable-line import/no-unresolved, import/no-extraneous-dependencies
var lambda = new aws.Lambda();

//
// var Promise = require('bluebird');
//
// Promise.config({
//   longStackTraces: true
// });
var dynamo = new aws.DynamoDB.DocumentClient();
/**
 * acquire photo states:
 *  executing assignment
 *  awaiting photo (paused)
 *  awaiting photographer (paused)
 * cases:
 *  no photographers registered/with remaining assignments.
 *  no photographers available.
 *  photographer available.
 *
 *  no pending photos
 *  photos pending
 */

var constants = {
  MODULE: 'assign.js',
  ERROR_SERVER: 'ServerError',
  // resources
  TABLE_PHOTO_REGISTRATIONS_NAME: 'PHOTO_REGISTRATIONS_TABLE'
  /**
   * Errors
   */

};

var ServerError =
/*#__PURE__*/
function (_Error) {
  _inherits(ServerError, _Error);

  function ServerError(message) {
    var _this;

    _classCallCheck(this, ServerError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ServerError).call(this, message));
    _this.name = constants.ERROR_SERVER;
    return _this;
  }

  return ServerError;
}(_wrapNativeSuper(Error));

var impl = {
  queryPhotographersParams: function queryPhotographersParams(assignmentCount, priorData) {
    var params = {
      TableName: constants.TABLE_PHOTO_REGISTRATIONS_NAME,
      IndexName: 'Assignments',
      KeyConditionExpression: '#as = :as',
      ExpressionAttributeNames: {
        '#as': 'assignments'
      },
      ExpressionAttributeValues: {
        ':as': assignmentCount
      }
    };

    if (priorData && priorData.LastEvaluatedKey) {
      params.LastEvaluatedKey = priorData.LastEvaluatedKey;
    }

    return params;
  },
  updatePhotographerParams: function updatePhotographerParams(event, photographer) {
    var updated = Date.now();
    return {
      TableName: constants.TABLE_PHOTO_REGISTRATIONS_NAME,
      Key: {
        id: photographer.id
      },
      ConditionExpression: 'attribute_not_exists(#aa)',
      UpdateExpression: ['set', '#u=:u,', '#ub=:ub,', '#aa=:aa'].join(' '),
      ExpressionAttributeNames: {
        '#u': 'updated',
        '#ub': 'updatedBy',
        '#aa': 'assignment'
      },
      ExpressionAttributeValues: {
        ':u': updated,
        ':ub': event.origin,
        ':aa': event.data.id.toString()
      },
      ReturnValues: 'NONE',
      ReturnConsumedCapacity: 'NONE',
      ReturnItemCollectionMetrics: 'NONE'
    };
  },
  queryAndAssignPhotographersByAssignmentCount: function (event, assignmentCount) {
    var priorData = {};
    var queryParams = impl.queryPhotographersParams(assignmentCount, priorData);
    var data = dynamo.query(queryParams);
    if (data && data.Items && Array.isArray(data.Items) && data.Items.length) {
      var item = data.Items[0];
      if ( /*check if photographer has too few assignments*/ true) {
        var updateParams = impl.updatePhotographerParams(event, item);
        dynamo.update(updateParams);
      }
      return item;
    }
    return null;
  },
  assignPhotographers: function(event) {
    var photographer;
    for (var i=0; i<30; i++) {
      photographer = impl.queryAndAssignPhotographersByAssignmentCount(event, i);
      if (photographer) {
        break;
      }
    }
    return photographer;
  } // Example event:
  // {
  //   schema: 'com.nordstrom/retail-stream/1-0-0',
  //   origin: 'hello-retail/product-producer-automation',
  //   timeOrigin: '2017-01-12T18:29:25.171Z',
  //   data: {
  //     schema: 'com.nordstrom/product/create/1-0-0',
  //     id: 4579874,
  //     brand: 'POLO RALPH LAUREN',
  //     name: 'Polo Ralph Lauren 3-Pack Socks',
  //     description: 'PAGE:/s/polo-ralph-lauren-3-pack-socks/4579874',
  //     category: 'Socks for Men',
  //   }
  // }

};

exports.handler = function (event, context, callback) {
  // console.log(JSON.stringify(event));
  var result = event;

  if (!result.photographers || !Array.isArray(result.photographers)) {
    result.photographers = [];
  }

  var photographer = impl.assignPhotographers(result);
  result.photographer = photographer;

  if (result.photographer) {
    result.photographers.push(result.photographer.id);
    result.assigned = 'true';
    result.assignmentComplete = 'false';

    var params = {
      FunctionName: 'product-photos-message-dev-message',
      InvocationType: "RequestResponse",
      Payload: JSON.stringify(result)
    };
    lambda.invoke(params, function (r) {
      callback(r)
    });
  } else {
    result.assigned = 'false';
    var params = {
      FunctionName: 'assign-product-photos-dev-assign',
      InvocationType: "RequestResponse",
      Payload: JSON.stringify(result)
    };
    lambda.invoke(params, function (r) {
      callback(r)
    });
    var params = {
      FunctionName: 'product-photos-record-assignment-dev-record',
      InvocationType: "RequestResponse",
      Payload: JSON.stringify(result)
    };
    lambda.invoke(params, function (r) {
      callback(r)
    })
  }

  callback(null, result);
};

var ev = {
  origin: TAJS_make('AnyStr'),
  data: {
    id: TAJS_make('AnyStr')
  }
};

exports.handler( ev, null, function () {});