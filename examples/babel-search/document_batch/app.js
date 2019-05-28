"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var AWS = require("aws-sdk");

var AWSHelper = require("aws-functions");

var s3 = new AWS.S3();
var BUCKET_NAME, IndexConfig;

exports.lambdaHandler =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(event, context) {
    var AllArticles, listOfDocuments, listOfDocumentPromises, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, documentName, PromiseResults, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, result, isArray, DocumentName;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            BUCKET_NAME = 'TargetBucket'; //fetch previous cache of documents

            AllArticles = []; //fetch every document uploaded to S3 in articles folder

            _context.next = 4;
            return AWSHelper.listObjects(BUCKET_NAME, "articles/");

          case 4:
            listOfDocuments = _context.sent;

            if (!(listOfDocuments.length <= 5)) {
              _context.next = 8;
              break;
            }

            console.log("No batching operation needed, too few items");
            return _context.abrupt("return", "No need to batch");

          case 8:
            console.log("Got articles list ...");
            listOfDocumentPromises = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 13;

            for (_iterator = listOfDocuments[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              documentName = _step.value;
              listOfDocumentPromises.push(AWSHelper.getJSONFile(BUCKET_NAME, documentName, true));
            }

            _context.next = 21;
            break;

          case 17:
            _context.prev = 17;
            _context.t0 = _context["catch"](13);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 21:
            _context.prev = 21;
            _context.prev = 22;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 24:
            _context.prev = 24;

            if (!_didIteratorError) {
              _context.next = 27;
              break;
            }

            throw _iteratorError;

          case 27:
            return _context.finish(24);

          case 28:
            return _context.finish(21);

          case 29:
            _context.next = 31;
            return Promise.all(listOfDocumentPromises);

          case 31:
            PromiseResults = _context.sent;
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context.prev = 35;
            _iterator2 = PromiseResults[Symbol.iterator]();

          case 37:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context.next = 47;
              break;
            }

            result = _step2.value;

            if (!(result != null)) {
              _context.next = 44;
              break;
            }

            isArray = Array.isArray(result);

            if (isArray) {
              AllArticles = AllArticles.concat(result);
            } else {
              AllArticles.push(result);
            } //mark for deletion


            _context.next = 44;
            return AWSHelper.deleteFromS3(BUCKET_NAME, result.s3key);

          case 44:
            _iteratorNormalCompletion2 = true;
            _context.next = 37;
            break;

          case 47:
            _context.next = 53;
            break;

          case 49:
            _context.prev = 49;
            _context.t1 = _context["catch"](35);
            _didIteratorError2 = true;
            _iteratorError2 = _context.t1;

          case 53:
            _context.prev = 53;
            _context.prev = 54;

            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }

          case 56:
            _context.prev = 56;

            if (!_didIteratorError2) {
              _context.next = 59;
              break;
            }

            throw _iteratorError2;

          case 59:
            return _context.finish(56);

          case 60:
            return _context.finish(53);

          case 61:
            console.log("marked " + AllArticles.length + "articles for deletion");

            if (!(AllArticles.length > 0)) {
              _context.next = 67;
              break;
            }

            //upload a batched document to S3
            DocumentName = "batched-" + Date.now();
            console.log("Batched as " + documentName);
            _context.next = 67;
            return AWSHelper.uploadToS3(BUCKET_NAME, "articles/" + DocumentName + ".json", JSON.stringify(AllArticles));

          case 67:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[13, 17, 21, 29], [22,, 24, 28], [35, 49, 53, 61], [54,, 56, 60]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();