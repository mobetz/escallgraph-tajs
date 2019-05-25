"use strict";

var aws = require('aws-sdk');

var gm = require('gm').subClass({
  imageMagick: true
});

var path = require('path');

var s3 = new aws.S3();
var destBucket = process.env.DEST_BUCKET;
var rotateDegrees = process.env.ROTATE_DEGREES;
var backgroundColor = process.env.BACKGROUND_COLOR;

exports.handler = function main(event, context) {
  // Fail on mising data
  if (!destBucket || !backgroundColor || !rotateDegrees) {
    context.fail('Error: Environment variable missing');
    return;
  }

  if (event.Records === null) {
    context.fail('Error: Event has no records.');
    return;
  } // Make a task for each record


  var tasks = [];

  for (var i = 0; i < event.Records.length; i++) {
    tasks.push(conversionPromise(event.Records[i], destBucket));
  }

  Promise.all(tasks).then(function () {
    context.succeed();
  })["catch"](function (err) {
    console.error('failed');
    console.error(JSON.stringify(event));
    console.error(JSON.stringify(context));
    context.fail(err);
  });
};

function conversionPromise(record, destBucket) {
  return new Promise(function (resolve, reject) {
    // The source bucket and source key are part of the event data
    var srcBucket = record.s3.bucket.name;
    var srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " ")); // Modify destKey if an alternate copy location is preferred

    var destKey = srcKey;
    var conversion = 'rotating (' + rotateDegrees + '° ' + backgroundColor + '): ' + srcBucket + ':' + srcKey + ' to ' + destBucket + ':' + destKey;
    console.log('Attempting: ' + conversion);
    get(srcBucket, srcKey).then(function (original) {
      return rotate(original);
    }).then(function (modified) {
      return put(destBucket, destKey, modified);
    }).then(function () {
      console.log('Success: ' + conversion);
      return resolve('Success: ' + conversion);
    })["catch"](function (error) {
      console.error(error);
      return reject(error);
    });
  });
}

function get(srcBucket, srcKey) {
  return new Promise(function (resolve, reject) {
    s3.getObject({
      Bucket: srcBucket,
      Key: srcKey
    }, function (err, data) {
      if (err) {
        console.error('Error getting object: ' + srcBucket + ':' + srcKey);
        return reject(err);
      } else {
        resolve(data.Body);
      }
    });
  });
}

function put(destBucket, destKey, data) {
  return new Promise(function (resolve, reject) {
    s3.putObject({
      Bucket: destBucket,
      Key: destKey,
      Body: data
    }, function (err, data) {
      if (err) {
        console.error('Error putting object: ' + destBucket + ':' + destKey);
        return reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function rotate(inBuffer) {
  return new Promise(function (resolve, reject) {
    var data = gm(inBuffer).rotate(backgroundColor, rotateDegrees);
    gmToBuffer(data).then(function (outBuffer) {
      resolve(outBuffer);
    })["catch"](function (err) {
      console.error('Error applying rotate');
      return reject(err);
    });
  });
} // From jescalan on https://github.com/aheckmann/gm/issues/572


function gmToBuffer(data) {
  return new Promise(function (resolve, reject) {
    data.stream(function (err, stdout, stderr) {
      if (err) {
        return reject(err);
      }

      var chunks = [];
      stdout.on('data', function (chunk) {
        chunks.push(chunk);
      }); // these are 'once' because they can and do fire multiple times for multiple errors,
      // but this is a promise so you'll have to deal with them one at a time

      stdout.once('end', function () {
        resolve(Buffer.concat(chunks));
      });
      stderr.once('data', function (data) {
        reject(String(data));
      });
    });
  });
}