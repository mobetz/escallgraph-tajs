"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var lunr = require("lunr");

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
    var AddedItem, AllArticles, listOfDocuments, listOfDocumentPromises, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, documentName, PromiseResults, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, result, isArray, IndexUploadPromiseArray, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, config, ShardSize, shardedArray, indexCount, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, articles, index;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            BUCKET_NAME = 'TargetBucket';
            AddedItem = event.Records[0].s3.object.key; //no need to index anything that hasn't been added to articles

            if (AddedItem.startsWith("articles/")) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", "Skipping the addition of a non-article");

          case 4:
            _context.next = 6;
            return AWSHelper.getJSONFile(BUCKET_NAME, "search_config.json");

          case 6:
            IndexConfig = _context.sent;

            if (!(IndexConfig == null)) {
              _context.next = 9;
              break;
            }

            return _context.abrupt("return", "Please set the Search Index Configuration before adding documents");

          case 9:
            //fetch previous cache of documents
            AllArticles = []; //fetch every document uploaded to S3 in articles folder

            _context.next = 12;
            return AWSHelper.listObjects(BUCKET_NAME, "articles/");

          case 12:
            listOfDocuments = _context.sent;
            console.log("Got articles list ...");
            listOfDocumentPromises = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 18;

            for (_iterator = listOfDocuments[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              documentName = _step.value;
              listOfDocumentPromises.push(AWSHelper.getJSONFile(BUCKET_NAME, documentName));
            }

            _context.next = 26;
            break;

          case 22:
            _context.prev = 22;
            _context.t0 = _context["catch"](18);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 26:
            _context.prev = 26;
            _context.prev = 27;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 29:
            _context.prev = 29;

            if (!_didIteratorError) {
              _context.next = 32;
              break;
            }

            throw _iteratorError;

          case 32:
            return _context.finish(29);

          case 33:
            return _context.finish(26);

          case 34:
            _context.next = 36;
            return Promise.all(listOfDocumentPromises);

          case 36:
            PromiseResults = _context.sent;
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context.prev = 40;

            for (_iterator2 = PromiseResults[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              result = _step2.value;

              if (result != null) {
                isArray = Array.isArray(result);

                if (isArray) {
                  AllArticles = AllArticles.concat(result);
                } else {
                  AllArticles.push(result);
                }
              }
            }

            _context.next = 48;
            break;

          case 44:
            _context.prev = 44;
            _context.t1 = _context["catch"](40);
            _didIteratorError2 = true;
            _iteratorError2 = _context.t1;

          case 48:
            _context.prev = 48;
            _context.prev = 49;

            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }

          case 51:
            _context.prev = 51;

            if (!_didIteratorError2) {
              _context.next = 54;
              break;
            }

            throw _iteratorError2;

          case 54:
            return _context.finish(51);

          case 55:
            return _context.finish(48);

          case 56:
            IndexUploadPromiseArray = []; //make indexes and upload them

            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            _context.prev = 60;
            _iterator3 = IndexConfig.configs[Symbol.iterator]();

          case 62:
            if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
              _context.next = 89;
              break;
            }

            config = _step3.value;
            ShardSize = config.shards || 1000;
            shardedArray = ShardArray(AllArticles, ShardSize);
            indexCount = 1;
            _iteratorNormalCompletion4 = true;
            _didIteratorError4 = false;
            _iteratorError4 = undefined;
            _context.prev = 70;

            for (_iterator4 = shardedArray[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              articles = _step4.value;
              //build the index up for each shard and upload new index
              index = lunr(function () {
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                  for (var _iterator5 = config.fields[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var field = _step5.value;
                    this.field(field);
                  }
                } catch (err) {
                  _didIteratorError5 = true;
                  _iteratorError5 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
                      _iterator5["return"]();
                    }
                  } finally {
                    if (_didIteratorError5) {
                      throw _iteratorError5;
                    }
                  }
                }

                this.ref(config.ref);
                articles.forEach(function (article) {
                  this.add(article);
                }, this);
              }); //upload JSON Indexes in Parallel

              IndexUploadPromiseArray.push(AWSHelper.uploadToS3(BUCKET_NAME, "indexes/" + config.name + "/search_index_" + indexCount + ".json", JSON.stringify(index)));
              console.log("Uploaded index: " + config.name + "_" + indexCount);
              indexCount++;
            }

            _context.next = 78;
            break;

          case 74:
            _context.prev = 74;
            _context.t2 = _context["catch"](70);
            _didIteratorError4 = true;
            _iteratorError4 = _context.t2;

          case 78:
            _context.prev = 78;
            _context.prev = 79;

            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }

          case 81:
            _context.prev = 81;

            if (!_didIteratorError4) {
              _context.next = 84;
              break;
            }

            throw _iteratorError4;

          case 84:
            return _context.finish(81);

          case 85:
            return _context.finish(78);

          case 86:
            _iteratorNormalCompletion3 = true;
            _context.next = 62;
            break;

          case 89:
            _context.next = 95;
            break;

          case 91:
            _context.prev = 91;
            _context.t3 = _context["catch"](60);
            _didIteratorError3 = true;
            _iteratorError3 = _context.t3;

          case 95:
            _context.prev = 95;
            _context.prev = 96;

            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }

          case 98:
            _context.prev = 98;

            if (!_didIteratorError3) {
              _context.next = 101;
              break;
            }

            throw _iteratorError3;

          case 101:
            return _context.finish(98);

          case 102:
            return _context.finish(95);

          case 103:
            _context.prev = 103;
            _context.next = 106;
            return Promise.all(IndexUploadPromiseArray);

          case 106:
            _context.next = 111;
            break;

          case 108:
            _context.prev = 108;
            _context.t4 = _context["catch"](103);
            console.log("Something went wrong: ", _context.t4);

          case 111:
            _context.next = 113;
            return AWSHelper.uploadToS3(BUCKET_NAME, "articles_all.json", JSON.stringify(AllArticles));

          case 113:
            console.log("Uploaded all articles back!");

          case 114:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[18, 22, 26, 34], [27,, 29, 33], [40, 44, 48, 56], [49,, 51, 55], [60, 91, 95, 103], [70, 74, 78, 86], [79,, 81, 85], [96,, 98, 102], [103, 108]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function ShardArray(allitems, chunk_size) {
  var arrays = [];
  var StartIndex = 0;

  while (StartIndex <= allitems.length) {
    arrays.push(allitems.slice(StartIndex, StartIndex + chunk_size));
    StartIndex += chunk_size;
  }

  return arrays;
}