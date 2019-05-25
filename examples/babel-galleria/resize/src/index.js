"use strict";

var aws = require('aws-sdk');

var gm = require('gm').subClass({
  imageMagick: true
});

var path = require('path');

var s3 = new aws.S3();
var destBucket = process.env.DEST_BUCKET;
var maxDimension = process.env.MAX_DIMENSION;

exports.handler = function main(event, context) {
  // Fail on mising data
  if (!destBucket || !maxDimension) {
    context.fail('Error: Environment variable DEST_BUCKET missing');
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
    context.fail(err);
  });
};

function conversionPromise(record, destBucket) {
  return new Promise(function (resolve, reject) {
    // The source bucket and source key are part of the event data
    var srcBucket = record.s3.bucket.name;
    var srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " ")); // Modify destKey if an alternate copy location is preferred

    var destKey = srcKey;
    var conversion = 'resizing (max dimension ' + maxDimension + '): ' + srcBucket + ':' + srcKey + ' to ' + destBucket + ':' + destKey;
    console.log('Attempting: ' + conversion);
    get(srcBucket, srcKey).then(function (original) {
      return resize(original);
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

function resize(inBuffer) {
  return new Promise(function (resolve, reject) {
    gm(inBuffer).resize(maxDimension, maxDimension).toBuffer('JPG', function (err, outBuffer) {
      if (err) {
        console.error('Error applying resize');
        return reject(err);
      } else {
        resolve(outBuffer);
      }
    });
  });
}