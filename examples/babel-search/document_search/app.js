"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var lunr = require("lunr");

var fs = require("fs");

var AWS = require("aws-sdk");

var AWSHelper = require("aws-functions");

var s3 = new AWS.S3();

var Validator = require("jsonschema").Validator;

var v = new Validator();
var SearchConfigSchema = {
  id: "/SearchConfig",
  type: "object",
  properties: {
    fields: {
      type: "array",
      items: {
        type: "string"
      }
    },
    ref: {
      type: "string"
    },
    name: {
      type: "string"
    }
  },
  required: ["fields", "ref", "name"]
};
var BUCKET_NAME, API_KEY;
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @param {string} event.resource - Resource path.
 * @param {string} event.path - Path parameter.
 * @param {string} event.httpMethod - Incoming request's method name.
 * @param {Object} event.headers - Incoming request headers.
 * @param {Object} event.queryStringParameters - query string parameters.
 * @param {Object} event.pathParameters - path parameters.
 * @param {Object} event.stageVariables - Applicable stage variables.
 * @param {Object} event.requestContext - Request context, including authorizer-returned key-value pairs, requestId, sourceIp, etc.
 * @param {Object} event.body - A JSON string of the request payload.
 * @param {boolean} event.body.isBase64Encoded - A boolean flag to indicate if the applicable request payload is Base64-encode
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 * @param {string} context.logGroupName - Cloudwatch Log Group name
 * @param {string} context.logStreamName - Cloudwatch Log stream name.
 * @param {string} context.functionName - Lambda function name.
 * @param {string} context.memoryLimitInMB - Function memory.
 * @param {string} context.functionVersion - Function version identifier.
 * @param {function} context.getRemainingTimeInMillis - Time in milliseconds before function times out.
 * @param {string} context.awsRequestId - Lambda request ID.
 * @param {string} context.invokedFunctionArn - Function ARN.
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * @returns {boolean} object.isBase64Encoded - A boolean flag to indicate if the applicable payload is Base64-encode (binary support)
 * @returns {string} object.statusCode - HTTP Status Code to be returned to the client
 * @returns {Object} object.headers - HTTP Headers to be returned
 * @returns {Object} object.body - JSON Payload to be returned
 *
 */

exports.lambdaHandler =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(event, context) {
    var path, method, query, count, index, document, config;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            BUCKET_NAME = 'TargetBucket';
            API_KEY = process.env.INTERNAL_API_KEY;
            path = event.path;
            method = event.httpMethod;
            _context.prev = 4;
            _context.t0 = path;
            _context.next = _context.t0 === "/search" ? 8 : _context.t0 === "/add" ? 14 : _context.t0 === "/internal/config" ? 21 : 31;
            break;

          case 8:
            query = event.queryStringParameters.q;
            count = event.queryStringParameters.count || 25;
            index = event.queryStringParameters.index;
            _context.next = 13;
            return SearchForDocument(query, count, index);

          case 13:
            return _context.abrupt("return", _context.sent);

          case 14:
            _context.t1 = event.httpMethod;
            _context.next = _context.t1 === "POST" ? 17 : 21;
            break;

          case 17:
            document = JSON.parse(event.body);
            _context.next = 20;
            return UploadArticle(document);

          case 20:
            return _context.abrupt("return", _context.sent);

          case 21:
            _context.t2 = event.httpMethod;
            _context.next = _context.t2 === "POST" ? 24 : _context.t2 === "GET" ? 28 : 31;
            break;

          case 24:
            config = JSON.parse(event.body);
            _context.next = 27;
            return UpdateConfigDocument(config);

          case 27:
            return _context.abrupt("return", _context.sent);

          case 28:
            _context.next = 30;
            return GetConfigDocument();

          case 30:
            return _context.abrupt("return", _context.sent);

          case 31:
            return _context.abrupt("return", BuildResponse(400, "Not a valid path, or you don't have access to it", false));

          case 32:
            _context.next = 38;
            break;

          case 34:
            _context.prev = 34;
            _context.t3 = _context["catch"](4);
            console.log("ERROR", _context.t3);
            return _context.abrupt("return", BuildResponse(500, "An unexpected error occured, please check your input or search logs"));

          case 38:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[4, 34]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function GetConfigDocument() {
  return _GetConfigDocument.apply(this, arguments);
}

function _GetConfigDocument() {
  _GetConfigDocument = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var configs;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return AWSHelper.getJSONFile(BUCKET_NAME, "search_config.json");

          case 3:
            configs = _context2.sent;
            return _context2.abrupt("return", BuildResponse(200, configs, true));

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](0);
            console.log(_context2.t0.message);
            console.log("Search Config does not exist!");
            return _context2.abrupt("return", BuildResponse(400, "No search configuration exists. You must upload one"));

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 7]]);
  }));
  return _GetConfigDocument.apply(this, arguments);
}

function UpdateConfigDocument(_x3) {
  return _UpdateConfigDocument.apply(this, arguments);
}

function _UpdateConfigDocument() {
  _UpdateConfigDocument = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(SearchConfig) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, index, schemaCheck, listOfMessages, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, err;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!(!SearchConfig.apikey || SearchConfig.apikey != API_KEY)) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt("return", BuildResponse(401, "You may not update the config"));

          case 2:
            if (SearchConfig.configs) {
              _context3.next = 4;
              break;
            }

            return _context3.abrupt("return", BuildResponse(400, "Missing List of Index Configurations"));

          case 4:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context3.prev = 7;
            _iterator = SearchConfig.configs[Symbol.iterator]();

          case 9:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context3.next = 41;
              break;
            }

            index = _step.value;
            schemaCheck = v.validate(index, SearchConfigSchema);

            if (isValidIndexName(index.name)) {
              _context3.next = 14;
              break;
            }

            return _context3.abrupt("return", BuildResponse(400, "Invalid Index Name. Names must be one-word and lowercase:  " + index.name));

          case 14:
            console.log(schemaCheck);

            if (!(schemaCheck["errors"] && schemaCheck.errors.length > 0)) {
              _context3.next = 38;
              break;
            }

            console.log("Cannot Upload Document, Search config invalid!");
            listOfMessages = [];
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context3.prev = 21;

            for (_iterator2 = schemaCheck.errors[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              err = _step2.value;
              listOfMessages.push(err.stack);
            }

            _context3.next = 29;
            break;

          case 25:
            _context3.prev = 25;
            _context3.t0 = _context3["catch"](21);
            _didIteratorError2 = true;
            _iteratorError2 = _context3.t0;

          case 29:
            _context3.prev = 29;
            _context3.prev = 30;

            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }

          case 32:
            _context3.prev = 32;

            if (!_didIteratorError2) {
              _context3.next = 35;
              break;
            }

            throw _iteratorError2;

          case 35:
            return _context3.finish(32);

          case 36:
            return _context3.finish(29);

          case 37:
            return _context3.abrupt("return", BuildResponse(400, "Invalid Search Index Schema: " + listOfMessages));

          case 38:
            _iteratorNormalCompletion = true;
            _context3.next = 9;
            break;

          case 41:
            _context3.next = 47;
            break;

          case 43:
            _context3.prev = 43;
            _context3.t1 = _context3["catch"](7);
            _didIteratorError = true;
            _iteratorError = _context3.t1;

          case 47:
            _context3.prev = 47;
            _context3.prev = 48;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 50:
            _context3.prev = 50;

            if (!_didIteratorError) {
              _context3.next = 53;
              break;
            }

            throw _iteratorError;

          case 53:
            return _context3.finish(50);

          case 54:
            return _context3.finish(47);

          case 55:
            _context3.prev = 55;
            _context3.next = 58;
            return AWSHelper.uploadToS3(BUCKET_NAME, "search_config.json", JSON.stringify(SearchConfig));

          case 58:
            console.log("Uploaded search configuration for: " + index.name);
            return _context3.abrupt("return", BuildResponse(200, "Index Config Updated"));

          case 62:
            _context3.prev = 62;
            _context3.t2 = _context3["catch"](55);
            console.log(_context3.t2);
            return _context3.abrupt("return", BuildResponse(400, "Uploading Configuration Failed. Please check logs"));

          case 66:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[7, 43, 47, 55], [21, 25, 29, 37], [30,, 32, 36], [48,, 50, 54], [55, 62]]);
  }));
  return _UpdateConfigDocument.apply(this, arguments);
}

function UploadArticle(_x4) {
  return _UploadArticle.apply(this, arguments);
}

function _UploadArticle() {
  _UploadArticle = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(document) {
    var params;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            //add to S3 Bucket
            params = {
              Bucket: BUCKET_NAME,
              Key: "articles/" + Date.now() + ".json",
              Body: JSON.stringify(document)
            };
            _context4.prev = 1;
            _context4.next = 4;
            return s3.putObject(params).promise();

          case 4:
            return _context4.abrupt("return", BuildResponse(200, "Article Added"));

          case 7:
            _context4.prev = 7;
            _context4.t0 = _context4["catch"](1);
            console.log(_context4.t0);
            return _context4.abrupt("return", BuildResponse(400, "Upload Article Failed"));

          case 11:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[1, 7]]);
  }));
  return _UploadArticle.apply(this, arguments);
}

function SearchForDocument(_x5) {
  return _SearchForDocument.apply(this, arguments);
}

function _SearchForDocument() {
  _SearchForDocument = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(query) {
    var numValues,
        indexName,
        SearchResults,
        listOfShards,
        listOfDocumentPromises,
        _iteratorNormalCompletion3,
        _didIteratorError3,
        _iteratorError3,
        _iterator3,
        _step3,
        documentName,
        allIndexes,
        _iteratorNormalCompletion4,
        _didIteratorError4,
        _iteratorError4,
        _iterator4,
        _step4,
        index,
        _args5 = arguments;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            numValues = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : 25;
            indexName = _args5.length > 2 ? _args5[2] : undefined;
            console.log("Searching Index for ", query);

            if (!(!indexName || !isValidIndexName(indexName))) {
              _context5.next = 5;
              break;
            }

            return _context5.abrupt("return", BuildResponse(400, "Invalid Index Name Provided"));

          case 5:
            console.log("Got Request..");
            SearchResults = []; //Load Multiple Indexes from S3

            _context5.prev = 7;
            _context5.next = 10;
            return AWSHelper.listObjects(BUCKET_NAME, "indexes/" + indexName + "/");

          case 10:
            listOfShards = _context5.sent;
            console.log("Received List of Shards...");
            listOfDocumentPromises = [];
            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            _context5.prev = 16;

            for (_iterator3 = listOfShards[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              documentName = _step3.value;
              listOfDocumentPromises.push(AWSHelper.getJSONFile(BUCKET_NAME, documentName));
            }

            _context5.next = 24;
            break;

          case 20:
            _context5.prev = 20;
            _context5.t0 = _context5["catch"](16);
            _didIteratorError3 = true;
            _iteratorError3 = _context5.t0;

          case 24:
            _context5.prev = 24;
            _context5.prev = 25;

            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }

          case 27:
            _context5.prev = 27;

            if (!_didIteratorError3) {
              _context5.next = 30;
              break;
            }

            throw _iteratorError3;

          case 30:
            return _context5.finish(27);

          case 31:
            return _context5.finish(24);

          case 32:
            _context5.prev = 32;
            _context5.next = 35;
            return Promise.all(listOfDocumentPromises);

          case 35:
            allIndexes = _context5.sent;
            console.log("Got all Indexes...");
            _iteratorNormalCompletion4 = true;
            _didIteratorError4 = false;
            _iteratorError4 = undefined;
            _context5.prev = 40;
            _iterator4 = allIndexes[Symbol.iterator]();

          case 42:
            if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
              _context5.next = 52;
              break;
            }

            index = _step4.value;

            if (!(index != null)) {
              _context5.next = 48;
              break;
            }

            SearchResults = SearchResults.concat(GetSearchResults(index, query, numValues));
            _context5.next = 49;
            break;

          case 48:
            return _context5.abrupt("return", BuildResponse(500, "Something went wrong while trying to query the index..."));

          case 49:
            _iteratorNormalCompletion4 = true;
            _context5.next = 42;
            break;

          case 52:
            _context5.next = 58;
            break;

          case 54:
            _context5.prev = 54;
            _context5.t1 = _context5["catch"](40);
            _didIteratorError4 = true;
            _iteratorError4 = _context5.t1;

          case 58:
            _context5.prev = 58;
            _context5.prev = 59;

            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }

          case 61:
            _context5.prev = 61;

            if (!_didIteratorError4) {
              _context5.next = 64;
              break;
            }

            throw _iteratorError4;

          case 64:
            return _context5.finish(61);

          case 65:
            return _context5.finish(58);

          case 66:
            console.log("Got search results...");
            _context5.next = 73;
            break;

          case 69:
            _context5.prev = 69;
            _context5.t2 = _context5["catch"](32);
            console.log("Something went wrong while querying the index", _context5.t2);
            return _context5.abrupt("return", BuildResponse(500, "Something went wrong while trying to query the index..."));

          case 73:
            SearchResults.sort(function (hitA, hitB) {
              return hitB.score - hitA.score;
            });
            console.log("Sending sorted results", SearchResults);
            return _context5.abrupt("return", BuildResponse(200, SearchResults.slice(0, numValues), true));

          case 78:
            _context5.prev = 78;
            _context5.t3 = _context5["catch"](7);
            console.log("No Search Index was found");
            console.log(_context5.t3.message);
            return _context5.abrupt("return", BuildResponse(412, "No Search Index was found, or it was invalid. Make sure you have uploaded a index config first."));

          case 83:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[7, 78], [16, 20, 24, 32], [25,, 27, 31], [32, 69], [40, 54, 58, 66], [59,, 61, 65]]);
  }));
  return _SearchForDocument.apply(this, arguments);
}

function GetSearchResults(searchIndex, query, numValues) {
  //load the index to lunr
  var index = lunr.Index.load(searchIndex); //perform

  var results = index.query(function () {
    // exact matches should have the highest boost
    this.term(lunr.tokenizer(query), {
      boost: 100
    }); // prefix matches should be boosted slightly

    this.term(query, {
      boost: 10,
      usePipeline: false,
      wildcard: lunr.Query.wildcard.TRAILING
    }); // finally, try a fuzzy search with character 2, without any boost

    this.term(query, {
      boost: 5,
      usePipeline: false,
      editDistance: 2
    });
  });
  return results.slice(0, numValues);
}

function BuildResponse(statusCode, responseBody) {
  var shouldStringify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var body = "invalid response";

  if (shouldStringify) {
    body = JSON.stringify(responseBody);
  } else {
    body = JSON.stringify({
      msg: responseBody
    });
  }

  var response = {
    statusCode: statusCode,
    body: body
  };
  return response;
}

function isValidIndexName(str) {
  if (str) {
    var re = /^[a-z-]+$/g;
    return re.test(str);
  }

  return false;
}