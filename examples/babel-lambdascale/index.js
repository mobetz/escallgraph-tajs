'use strict';

var AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1'
}); // TODO: pull from environment or something

var zlib = require('zlib');

var _require = require('stream'),
    Transform = _require.Transform;

var cloudWatch = new AWS.CloudWatch();
var s3 = new AWS.S3();
var sqs = new AWS.SQS();
var lambda = new AWS.Lambda();
var BUCKET = 'commoncrawl';
var KEY ='crawl-data/CC-MAIN-2018-17/warc.paths.gz';
var INPUT_URL = 'arn:aws:sqs:us-east-1:XXX:CrawlQueue';
var METRIC_URL = 'arn:aws:sqs:us-east-1:XXX:MetricQueue';
var MAX_WORKERS =  4;
var DEFAULT_REGEX = '(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}';
var DEFAULT_REGEX_FLAGS = 'gm';
var REGEX = new RegExp(DEFAULT_REGEX, DEFAULT_REGEX_FLAGS);
var REQUEST_REGEX = new RegExp('\nWARC-Type: request', 'gm');
var WORK_REQUEST = 'work';
var START_REQUEST = 'start';
var ONE_MINUTE_MILLIS = 60 * 1000;
var invocations = 0;

function sandbag(delay) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, delay);
  });
} // borrows from SO


function shuffle(input) {
  for (var i = input.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var _ref = [input[j], input[i]];
    input[i] = _ref[0];
    input[j] = _ref[1];
  }

  return input;
}

function annoying(err) {
  //console.log("ANNOY: " + err);
}

function fatal(err) {
  //console.log("FATAL: " + err);
  process.exit(0);
}

function get_object(bucket, key) {
  var params = {
    Bucket: bucket,
    Key: key
  };
  return s3.getObject(params).promise()["catch"](function (err) {
    return fatal("Unable to get S3 data: " + err);
  });
}

function gunzipBuf(buffer) {
  return new Promise(function (resolve, reject) {
    zlib.gunzip(buffer, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function run_lambda(fxn_name, type, run_id, worker_id, launch_count) {
  var params = {
    FunctionName: fxn_name,
    Payload: JSON.stringify({
      type: type,
      run_id: run_id,
      worker_id: worker_id,
      launch_count: launch_count
    }),
    InvocationType: 'Event'
  };
  return lambda.invoke(params).promise()["catch"](function (err) {
    return fatal('Something went wrong invoking lambda ' + err);
  });
}

function populate_queue() {
  var max = process.env.MAX_CHUNKS ? parseInt(process.env.MAX_CHUNKS) : 2;
  var content = get_object(BUCKET, KEY);
  var manifest = gunzipBuf(content.Body);
  var all_archives = manifest.toString().split("\n"); // mix things up so we can test random archives other than the first couple

  var input = process.env.SHUFFLE ? shuffle(all_archives) : all_archives;
  var lines = input.slice(0, max).filter(function (data) {
    return 0 !== data.length;
  }); // limit for now

  //console.log("Populating with ".concat(lines.length, " archive entries"));
  var enqueuers = [];
  var count = 0;

  var _loop = function _loop(index) {
    var counter = 0;
    var entries = lines.slice(index, index + 10).map(function (line) {
      return {
        MessageBody: line,
        Id: "".concat(counter++) // There has to be a better way to do this

      };
    });
    var message = {
      Entries: entries,
      QueueUrl: INPUT_URL
    };
    count += entries.length;
    enqueuers.push(sqs.sendMessageBatch(message).promise());
  };

  for (var index = 0; index < lines.length; index = index + 10) {
    _loop(index);
  }

  Promise.all(enqueuers)["catch"](function (err) {
    return fatal("Something bad happened while enqueueing: " + err);
  }); // return what we did so we can wait for it

  return lines;
}

function get_queue_size() {
  var attr_params = {
    QueueUrl: INPUT_URL,
    AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible']
  };
  var results = sqs.getQueueAttributes(attr_params).promise()["catch"](function (err) {
    return fatal("Unable to determine queue depth: " + err);
  });
  return parseInt(results.Attributes.ApproximateNumberOfMessages) + parseInt(results.Attributes.ApproximateNumberOfMessagesNotVisible);
}

function _queue(target) {
  // the promises have all run, now we need to make sure SQS shows all of them
  // or our lambdas may start and immediately be done
  while (true) {
    var ready = get_queue_size();

    if (ready >= target) {
      // NB: type coercion here
      //console.log("Queue reports " + ready + " messages available");
      break;
    }

    //console.log("Waiting for messages to show in SQS, see " + ready + ", want " + target);
  }

  return true;
}

function warm_target(launch_count) {
  var depth = get_queue_size();
  var remaining = Math.max(0, MAX_WORKERS - launch_count);
  var initial = 3000;
  var step = 500;
  var limit = 0 === launch_count ? initial : step; // if we don't have a full step to do, do what we need

  var full_limit = Math.min(limit, remaining); // if our queue is empty then we don't want spin any more up,
  // or if we have half the increment step in the queue, don't spin up the full step

  //console.log("Calculating warm target from ".concat(limit, ", ").concat(remaining, " and ").concat(depth));
  return Math.min(full_limit, depth);
}

function driver(fxn_name, memorySize, run_id, launch_count) {
  var full_start_time = new Date().getTime();
  var first_run = 0 === launch_count;
  var lines = [];

  if (first_run) {
    //console.log("Starting ", fxn_name, run_id);
    lines = populate_queue();

    _queue(lines.length);
  }

  var target = warm_target(launch_count);
  //console.log("Launching ".concat(target, " workers"));
  var workers = [];

  for (var worker_id = 0; worker_id !== target; worker_id++) {
    workers.push(run_lambda(fxn_name, WORK_REQUEST, run_id, launch_count + worker_id));
  }

  if (first_run) {
    var launch_start_time = new Date().getTime();
    var metrics = [create_metric('memory_size', memorySize, 'Megabytes'), create_metric('full_start_time', full_start_time, 'Milliseconds'), create_metric('launch_start_time', launch_start_time, 'Milliseconds'), create_metric('total_workers', MAX_WORKERS), create_metric('total_chunks', lines.length)];
    on_metrics(metrics, fxn_name, run_id);
  }

  //console.log("Waiting for " + workers.length + " workers to spin up...");
  Promise.all(workers)["catch"](function (err) {
    return fatal("Something went wrong starting workers: " + err);
  }).then(function () {
    return "All launched for " + run_id;
  });
  var current_count = target + launch_count;

  if (0 === target) {
    //console.log("All workers launched");
    return;
  } // we want to launch every minute as close as possible


  var next_run_time = full_start_time + ONE_MINUTE_MILLIS;
  var sleep_time = Math.max(0, next_run_time - new Date().getTime());
  sandbag(sleep_time);
  //console.log("Recursing with launch count of ".concat(current_count));
  return run_lambda(fxn_name, START_REQUEST, run_id, 0, current_count);
}

function on_regex(data, run_id) {// if you want to do something on getting a hit, put it here
}

function handle_stream(stream, run_id) {
  var uncompressed_bytes = 0;
  var compressed_bytes = 0;
  var total_requests = 0;
  var count = 0;
  var start_time = new Date().getTime();
  var extractor = new Transform({
    transform: function transform(chunk, encoding, callback) {
      var _this = this;

      try {
        var matches = chunk.toString().match(REGEX) || [];
        matches.forEach(function (data) {
          return _this.push(data);
        });
      } catch (error) {
        annoying("Failed to extract: " + error);
      } finally {
        callback();
      }
    }
  });
  var gunzipper = zlib.createGunzip();
  var data_ts = 0;

  var log_traffic = function log_traffic() {
    var ts = new Date().getTime() / 1000;
    var elapsed = ts - data_ts;

    if (10 <= elapsed) {
      //console.log("Received data: " + compressed_bytes);
      data_ts = ts;
    }
  };

  new Promise(function (resolve, _reject) {
    var reject = function reject(message) {
      //console.log("Failed: " + message);

      _reject(message);
    };

    var gunzipStream = stream.on('error', function (err) {
      return fatal("GZip stream error " + err);
    }).on('data', log_traffic).on('data', function (data) {
      return compressed_bytes += data.length;
    }).on('end', function () {
      return //console.log("End of base stream");
    }).pipe(gunzipper);
    var extractorStream = gunzipStream.on('error', function (err) {
      return fatal("Extract stream error " + err);
    }).on('data', function (data) {
      // technically our stream could split our request
      // marker, but that will be rare, and over the total
      // number of requests we have we should be ok
      try {
        var requests = data.toString().match(REQUEST_REGEX) || [];
        total_requests += requests.length;
      } catch (error) {
        annoying("Failed to match batches: " + error);
      }
    }).on('data', function (data) {
      return uncompressed_bytes += data.length;
    }).on('end', function () {
      return //console.log("End of gzip stream");
    }).pipe(extractor);
    var extractedStream = extractorStream.on('error', function (err) {
      return fatal("Extracted stream error " + err);
    }).on('data', function () {
      return count++;
    }).on('data', function (data) {
      return on_regex(data, run_id);
    }).on('end', function () {
      //console.log("Streaming complete");
      resolve("complete");
    });
  });
  var now = new Date().getTime(); // we're measuring time internally, this isn't 100%, but go ahead
  // and round up to the nearest 100ms

  var elapsed = Math.ceil((now - start_time) / 100) * 100;
  return [create_metric('start_time', start_time, 'Milliseconds'), create_metric('regex_hits', count), create_metric('total_requests', total_requests), create_metric('compressed_bytes', compressed_bytes, 'Bytes'), create_metric('uncompressed_bytes', uncompressed_bytes, 'Bytes'), create_metric('elapsed_ms', elapsed, 'Milliseconds')];
}

function handle_path(path, run_id) {
  var params = {
    Bucket: BUCKET,
    Key: path
  };
  var stream = s3.getObject(params).on('httpHeaders', function (code, headers) {
    var requestId = headers['x-amz-request-id'];
    var amzId = headers['x-amz-id-2'];
    //console.log("Streaming as x-amz-id-2=" + amzId + ", x-amz-request-id=" + requestId + "/" + JSON.stringify(params));
  }).createReadStream();
  return handle_stream(stream, run_id);
}

function create_metric(key, value, unit) {
  return {
    key: key,
    value: value,
    unit: unit || 'Count'
  };
}

function on_metrics(metrics, fxn_name, run_id) {
  var date = new Date();
  var metricList = metrics.map(function (metric) {
    //console.log(metric.key + "." + run_id, ' -> ', metric.value);
    return {
      MetricName: metric.key,
      Dimensions: [{
        Name: 'run_id',
        Value: run_id
      }],
      Timestamp: date,
      Unit: metric.unit,
      Value: metric.value
    };
  });
  var update = {
    'MetricData': metricList,
    'Namespace': fxn_name // ... so for now, shunt to this queue

  };
  return sqs.sendMessage({
    MessageBody: JSON.stringify(update),
    QueueUrl: METRIC_URL
  }).promise()["catch"](function (err) {
    return fatal("Unable to send metric: " + err);
  });
}

function setVisibilityTimeout(message, time) {
  return sqs.changeMessageVisibility({
    QueueUrl: INPUT_URL,
    ReceiptHandle: message.ReceiptHandle,
    VisibilityTimeout: time
  }).promise().then(function () {
    return //console.log("Message ".concat(message.ReceiptHandle, " timeout set to ").concat(time));
  })["catch"](function (err) {
    return annoying("Failed to reset the visibility: " + err);
  });
}

function handle_message(fxn_name, run_id, worker_id, end_time) {
  var response = sqs.receiveMessage({
    QueueUrl: INPUT_URL
  }).promise()["catch"](function (err) {
    return fatal("Failed to receive message from queue: " + err);
  });
  var messages = response.Messages || []; // we're at the end of our queue, so send our done time
  // sometimes SQS gives us no work when we hammer it, so try a couple times before give up

  if (0 === messages.length && 0 !== invocations) {
    //console.log(worker_id + ": No work to do");
    var metric = create_metric('end_time', new Date().getTime(), 'Milliseconds');
    on_metrics([metric], fxn_name, run_id);
    return "All done";
  }

  invocations++;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop2 = function _loop2() {
      var message = _step.value;
      var metrics = [create_metric('messages_attempted', 1)]; // if we aren't done by panic_time then we need to push the message back

      var panic_time = end_time - new Date().getTime(); // with high concurrency, S3 gets mad causing timeouts, this handles that for us by pushing the message back on the queue

      var timer = setTimeout(function () {
        return setVisibilityTimeout(message, 0);
      }, panic_time);

      try {
        var message_metrics = handle_path(message.Body, run_id);
        metrics.push(create_metric("metrics_handled", 1));
        metrics = metrics.concat(message_metrics);
        clearTimeout(timer);
      } catch (error) {
        metrics.push(create_metric("messages_error", 1));
        annoying("Failed to handle path: " + error);
        Promise.all([setVisibilityTimeout(message, 0), on_metrics(metrics, fxn_name, run_id)]);
        return "break"; // don't delete, punt immediately
      }

      sqs.deleteMessage({
        QueueUrl: INPUT_URL,
        ReceiptHandle: message.ReceiptHandle
      }).promise()["catch"](function (err) {
        return fatal("Failed to delete message from queue: " + err);
      });
      on_metrics(metrics, fxn_name, run_id);
    };

    for (var _iterator = messages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ret = _loop2();

      if (_ret === "break") break;
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

  var run = run_lambda(fxn_name, WORK_REQUEST, run_id, worker_id);
  //console.log(run);
  return "All done";
}

exports.metric_handler = function (event) {
  var records = event.Records || [];
  var metrics = records.map(function (record) {
    var raw_payload = record.body;
    return JSON.parse(raw_payload);
  });
  persist_metric_batch(metrics);
  //console.log("Inserted ".concat(metrics.length, " metrics"));
};

function persist_metric_batch(messages) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = messages[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var message = _step2.value;
      cloudWatch.putMetricData(message).promise()["catch"](function (err) {
        return fatal("Error putting metric data: " + err);
      });
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return true;
}

exports.handler = function (args, context) {
  var type = args.type,
      run_id = args.run_id,
      worker_id = args.worker_id,
      launch_count = args.launch_count; // peel off N seconds to give us a bit of a buffer for the event to clear and code to run

  var grace_period = 3000;
  var end_time = new Date().getTime() + context.getRemainingTimeInMillis() - grace_period;

  switch (type) {
    case WORK_REQUEST:
      return handle_message(context.functionName, run_id, worker_id, end_time);

    case START_REQUEST:
      var memorySize = parseInt(context.memoryLimitInMB); // if we have a run id, use it, else, make one

      var id = process.env.RUN_ID || run_id;
      return driver(context.functionName, memorySize, id, launch_count || 0);
  }
};