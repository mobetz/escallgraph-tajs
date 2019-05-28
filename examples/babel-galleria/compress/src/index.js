"use strict";

var aws = require('aws-sdk');

var gmlib = require('gm');

var gm = gmlib.subClass({
  imageMagick: true
});


var s3 = new aws.S3();
var destBucket = 'THUMBS';
var quality = 90;

exports.handler = function main(event, context) {
  // Fail on mising data
  if (!destBucket || !quality) {
    //context.fail('Error: Environment variable DEST_BUCKET or QUALITY missing');
    return;
  }

  if (event.Records === null) {
    //context.fail('Error: Event has no records.');
    return;
  } // Make a task for each record


  var tasks = [];

  for (var i = 0; i < event.Records.length; i++) {
    tasks.push(conversionPromise(event.Records[i], destBucket));
  }

  Promise.all(tasks).then(function () {
    //context.succeed();
  })["catch"](function (err) {
    //context.fail(err);
  });
};

function conversionPromise(record, destBucket) {
  return new Promise(function (resolve, reject) {
    // The source bucket and source key are part of the event data
    var srcBucket = record.s3.bucket.name;
    var srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " ")); // Modify destKey if an alternate copy location is preferred

    var destKey = srcKey;
    var conversion = 'compressing (quality ' + quality + '): ' + srcBucket + ':' + srcKey + ' to ' + destBucket + ':' + destKey;
    //console.log('Attempting: ' + conversion);
    get(srcBucket, srcKey, function (data) {
      compress(data, function(modified) {
        put(destBucket, destKey, modified, function () {
          resolve('Success: ' + conversion);
        });
      })
    });
  });
}

function get(srcBucket, srcKey, cb) {
    s3.getObject({
      Bucket: srcBucket,
      Key: srcKey
    }, function (err, data) {
      if (err) {
        //console.error('Error getting object: ' + srcBucket + ':' + srcKey);
        return reject(err);
      } else {
        cb(data.Body);
      }
    });
}

function put(destBucket, destKey, data, cb) {
    s3.putObject({
      Bucket: destBucket,
      Key: destKey,
      Body: data
    }, function (err, data) {
      if (err) {
        //console.error('Error putting object: ' + destBucket + ':' + destKey);
        return reject(err);
      } else {
        cb(data);
      }
    });
}

function compress(inBuffer, cb) {
  gm(inBuffer).compress('JPEG').quality(quality).toBuffer('JPG', function (err, outBuffer) {
      if (err) {
        //console.error('Error applying compression');
        return reject(err);
      } else {
        cb(outBuffer);
      }
    });
}

exports.handler({
  Records: [
    {
      s3: {
        bucket: {name: 'RESIZED'},
        object: {key: TAJS_make('AnyStr')}
      }
    }]
}, null);