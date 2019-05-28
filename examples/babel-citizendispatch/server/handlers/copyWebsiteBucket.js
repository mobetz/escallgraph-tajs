"use strict";

var aws = require('aws-sdk');

var s3 = new aws.S3({
  apiVersion: '2006-03-01'
});
var srcBucket = "citizen-dispatch-client-dist";
var destBucket = process.env.TARGET_BUCKET; //|| "citizen-dispatch-client-dist-test";
//Main function

exports.handler = function (event, context, callback) {
  var allKeys = [];
  var opts = {
    Bucket: srcBucket
  };
  s3.listObjectsV2(opts, function (err, data) {
    if (err) callback(err);
    allKeys = allKeys.concat(data.Contents);
    console.log('All Keys:', allKeys);
    allKeys.forEach(function (key) {
      if (key.Key == 'app.js') {
        s3.getObject({
          Bucket: srcBucket,
          Key: key.Key
        }, function (getErr, getData) {
          if (getErr) console.log("Object get error: " + getErr);
          var newContent = getData.Body.toString('ascii').replace('REPLACE_API_ENDPOINT', process.env.API_ENDPOINT);
          s3.putObject({
            Body: newContent,
            Bucket: destBucket,
            Key: key.Key
          }, function (putErr, putData) {
            if (putErr) console.log("PutObject error: " + putErr);else console.log("PutObject OK");
          });
        });
      } else {
        s3.copyObject({
          CopySource: srcBucket + '/' + key.Key,
          Bucket: destBucket,
          Key: key.Key
        }, function (copyErr, copyData) {
          if (copyErr) {
            console.log("Error: " + copyErr);
          } else {
            console.log('Copied OK');
          }
        });
      }
    });
  });
  callback(null, 'Copy complete');
};