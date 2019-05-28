"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var fs = require("fs");

var alphanumeric = require("alphanumeric-id");

var rp = require("promise-request-retry");

var BaseURL = "https://hbmle8gyoc.execute-api.us-east-1.amazonaws.com";
fs.readFile("../movies.json", function read(err, data) {
  if (err) {
    throw err;
  }

  var listOfMovies = JSON.parse(data);
  console.log(listOfMovies.length);
  AddIDToListOfMovies(listOfMovies);
  console.log("Will perform test for " + listOfMovies.length + " Objects");
  IncrementBatchAndQuery(listOfMovies, 1, 1);
});

function AddIDToListOfMovies(listOfMovies) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = listOfMovies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var movie = _step.value;
      movie.id = alphanumeric(8);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function IncrementBatchAndQuery(listOfMovies, startBatchSize, incrementMultiplier) {
  IncrementBatchAndQueryHelper(listOfMovies, startBatchSize, 1, listOfMovies.length, 0, incrementMultiplier);
}

var indexedCount = 0;
var numFails = 0;

function IncrementBatchAndQueryHelper(_x, _x2, _x3, _x4, _x5, _x6) {
  return _IncrementBatchAndQueryHelper.apply(this, arguments);
}

function _IncrementBatchAndQueryHelper() {
  _IncrementBatchAndQueryHelper = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(listOfMovies, batchSize, batchCounter, remainingMovies, continuationIndex, incrementMultiplier) {
    var moviesBatch, firstMovieID, options, response;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(indexedCount >= listOfMovies.length - numFails)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return");

          case 2:
            //get the number of docs
            moviesBatch = listOfMovies.slice(continuationIndex, continuationIndex + batchSize);
            firstMovieID = moviesBatch[0].id; //increment the indexes for next run

            continuationIndex = continuationIndex + batchSize; //subtract the remaining movies

            remainingMovies = listOfMovies.length - continuationIndex - 1; //upload the documents

            options = {
              method: "POST",
              uri: BaseURL + "/Prod/add",
              body: moviesBatch,
              json: true,
              resolveWithFullResponse: true,
              retry: 3
            };
            _context.prev = 7;
            _context.next = 10;
            return rp(options);

          case 10:
            response = _context.sent;
            _context.next = 18;
            break;

          case 13:
            _context.prev = 13;
            _context.t0 = _context["catch"](7);
            console.log("Cannot Upload in Batch Count: " + batchCounter);
            console.log(_context.t0);
            throw _context.t0;

          case 18:
            //keep querying and retrying till the index is able to get the the first record ID that was uploaded in the batch
            RetryTillSuccess(firstMovieID, batchCounter, 50, function (responseTime, uploadedID, uploadIndex) {
              var percentIndexed = Math.floor(uploadIndex / listOfMovies.length * 100); //just to make sure logging as expected

              if (percentIndexed < 1) {
                console.log("Indexed Article Num:" + uploadIndex + " (~" + percentIndexed + "% uploaded) " + "Response Time (ms): " + responseTime + " For: " + uploadedID);
              }

              BuildPercentGraph(percentIndexed, responseTime, uploadedID, uploadIndex);
              indexedCount++;
            });
            return _context.abrupt("return", IncrementBatchAndQueryHelper(listOfMovies, batchSize, batchCounter + 1, remainingMovies, continuationIndex, incrementMultiplier));

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[7, 13]]);
  }));
  return _IncrementBatchAndQueryHelper.apply(this, arguments);
}

function RetryTillSuccess(_x7, _x8, _x9, _x10) {
  return _RetryTillSuccess2.apply(this, arguments);
}

function _RetryTillSuccess2() {
  _RetryTillSuccess2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(targetID, processId, retryMax, callback) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", _RetryTillSuccess(targetID, processId, 0, 1, retryMax, callback));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _RetryTillSuccess2.apply(this, arguments);
}

function _RetryTillSuccess(_x11, _x12, _x13, _x14, _x15, _x16) {
  return _RetryTillSuccess3.apply(this, arguments);
}

function _RetryTillSuccess3() {
  _RetryTillSuccess3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(targetID, processId, responseTime, retryCounter, retryMax, callback) {
    var options, endingTime, response, timings, _endingTime, searchResults;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!(retryCounter == retryMax)) {
              _context3.next = 5;
              break;
            }

            console.log("Note: Made 50 requests for " + targetID + " And Failed ... ");
            numFails++;
            callback(0, targetID + "[lost]", processId);
            return _context3.abrupt("return");

          case 5:
            options = {
              method: "GET",
              uri: BaseURL + "/Prod/search?" + "q=" + targetID + "&index=movies",
              resolveWithFullResponse: true,
              time: true
            };
            _context3.prev = 6;
            _context3.next = 9;
            return rp(options);

          case 9:
            response = _context3.sent;
            timings = response.request.timings;
            _endingTime = timings.end;
            searchResults = JSON.parse(response.body); //check if response has the correct index

            if (searchResults.length > 0 && targetID === searchResults[0].ref) {
              callback(responseTime + timings.end, targetID, processId);
            } else {
              _RetryTillSuccess(targetID, processId, responseTime + timings.end, retryCounter + 1, retryMax, callback);
            }

            _context3.next = 19;
            break;

          case 16:
            _context3.prev = 16;
            _context3.t0 = _context3["catch"](6);

            //console.log("Request or error occured for " + processId + " " + targetID);
            _RetryTillSuccess(targetID, processId, responseTime + endingTime, retryCounter + 1, retryMax, callback);

          case 19:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[6, 16]]);
  }));
  return _RetryTillSuccess3.apply(this, arguments);
}

var PercentGraph = {};

function BuildPercentGraph(percentIndexed, responseTime, idAdded, uploadIndex) {
  previousIndex = (percentIndexed - 1).toString();
  percentIndexed = percentIndexed.toString();

  if (parseFloat(responseTime)) {
    responseTime = parseFloat(responseTime);
  } else {
    responseTime = 1000;
  }

  if (PercentGraph[percentIndexed]) {
    PercentGraph[percentIndexed].count = PercentGraph[percentIndexed].count + 1;
    PercentGraph[percentIndexed].ids.push(idAdded);
    PercentGraph[percentIndexed].totalTime = PercentGraph[percentIndexed].totalTime + responseTime;
    var average = PercentGraph[percentIndexed].totalTime / PercentGraph[percentIndexed].count;
    PercentGraph[percentIndexed].avg = average;
  } else {
    PercentGraph[percentIndexed] = {
      count: 1,
      totalTime: responseTime,
      avg: responseTime,
      ids: [idAdded]
    };

    if (PercentGraph[previousIndex]) {
      console.log(previousIndex + "% complete and ~" + uploadIndex + " records indexed at an avg of " + PercentGraph[previousIndex].avg + " Ids: " + PercentGraph[previousIndex].ids.slice(0, 8));
      console.log(PercentGraph);
    }
  }
}