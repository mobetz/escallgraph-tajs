"use strict";

var aws = require('aws-sdk');

var fs = require('fs');

var mime = require('mime-types');

var path = require('path');

var s3 = new aws.S3();
var thumbBucket = process.env.THUMB_BUCKET;
var fullBucket = process.env.FULL_BUCKET;

exports.handler = function main(event, context, lambdaCallback) {
  // Fail on mising data
  if (!thumbBucket || !fullBucket) {
    context.fail('Error: Environment variable THUMB_BUCKET and/or FULL_BUCKET is missing');
    return;
  }

  if (event.path.startsWith('/api/thumb/') || event.path.startsWith('/api/full/')) {
    return imageRoute(event, context, lambdaCallback);
  } else {
    return servePublic(event, context, lambdaCallback);
  }
};

function imageRoute(event, context, lambdaCallback) {
  if (event.httpMethod === 'GET') {
    var bucket = event.path.startsWith('/api/thumb/') ? thumbBucket : fullBucket;
    var key = event.path.replace(/\/api\/(full|thumb)\//, '');
    var mimeType = mime.lookup(key);
    get(bucket, key).then(function (data) {
      if (mimeType === 'image/png' || mimeType === 'image/jpeg' || mimeType === 'image/x-icon') {
        // Base 64 encode binary images
        console.log('Serving binary ' + bucket + ':' + key + ' (' + mimeType + ')');
        return done(200, data.toString('base64'), mimeType, lambdaCallback, true);
      } else {
        console.log('Serving text ' + bucket + ':' + key + ' (' + mimeType + ')');
        return done(200, data.toString(), mimeType, lambdaCallback);
      }
    })["catch"](function (error) {
      console.error(error);
      done(500, '{"message":"error serving"}', 'application/json', lambdaCallback);
    });
  } else {
    return done(400, '{"message":"Invalid HTTP Method"}', 'application/json', lambdaCallback);
  }
}

function servePublic(event, context, lambdaCallback) {
  // Set urlPath
  var urlPath;

  if (event.path === '/') {
    return serveIndex(event, context, lambdaCallback);
  } else {
    urlPath = event.path;
  } // Determine the file's path on lambda's filesystem


  var publicPath = path.join(process.env.LAMBDA_TASK_ROOT, 'public');
  var filePath = path.resolve(path.join(publicPath, urlPath));
  var mimeType = mime.lookup(filePath); // Make sure the user doesn't try to break out of the public directory

  if (!filePath.startsWith(publicPath)) {
    console.log('forbidden', filePath, publicPath);
    return done(403, '{"message":"Forbidden"}', 'application/json', lambdaCallback);
  } // Attempt to read the file, give a 404 on error


  fs.readFile(filePath, function (err, data) {
    if (err) {
      console.log('Unfound asset: ' + urlPath);
      return done(404, '{"message":"Not Found"}', 'application/json', lambdaCallback);
    } else if (mimeType === 'image/png' || mimeType === 'image/jpeg' || mimeType === 'image/x-icon' || mimeType === 'application/font-woff' || mimeType === 'application/font-woff2' || mimeType === 'application/vnd.ms-fontobject' || mimeType === 'application/x-font-ttf') {
      // Base 64 encode binary files
      console.log('Serving binary asset: ' + urlPath);
      return done(200, data.toString('base64'), mimeType, lambdaCallback, true);
    } else {
      console.log('Serving text asset: ' + urlPath);
      return done(200, data.toString(), mimeType, lambdaCallback);
    }
  });
}

function serveIndex(event, context, lambdaCallback) {
  // Determine base path on whether the API Gateway stage is in the path or not
  var base_path = '/';

  if (event.requestContext.path.startsWith('/' + event.requestContext.stage)) {
    base_path = '/' + event.requestContext.stage + '/';
  }

  var filePath = path.join(process.env.LAMBDA_TASK_ROOT, 'public', 'index.template.html');
  var thumbBaseUrl = 'https://' + event.headers.Host + base_path + 'api/thumb/';
  var fullBaseUrl = 'https://' + event.headers.Host + base_path + 'api/full/';
  fs.readFile(filePath, function (err, data) {
    if (err) {
      console.log('Failed to load template: ' + filePath);
      return done(500, '{"message":"internal server error"}', 'application/json', lambdaCallback);
    }

    list(thumbBucket).then(function (contents) {
      var html = '';

      for (var i = 0; i < contents.length; i++) {
        html += '<div class="grid-item item animate-box" data-animate-effect="fadeIn">\n';
        html += '  <a href="' + fullBaseUrl + contents[i].Key + '">\n';
        html += '    <div class="img-wrap">\n';
        html += '      <img src="' + thumbBaseUrl + contents[i].Key + '" alt="" class="img-responsive">\n';
        html += '    </div>\n';
        html += '  </a>\n';
        html += '</div>\n';
      }

      var output = data.toString().replace('{{photos}}', html);
      return done(200, output, 'text/html', lambdaCallback);
    })["catch"](function (error) {
      console.error(error);
      done(500, '{"message":"internal server error"}', 'application/json', lambdaCallback);
    });
  });
} // We're done with this lambda, return to the client with given parameters


function done(statusCode, body, contentType, lambdaCallback) {
  var isBase64Encoded = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  lambdaCallback(null, {
    statusCode: statusCode,
    isBase64Encoded: isBase64Encoded,
    body: body,
    headers: {
      'Content-Type': contentType
    }
  });
} // Create a promise to get a file from an S3 Bucket


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
} // Create a promise to get the list of files from an S3 Bucket
// TODO Pagination - this only grabs the first 1000
// See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property


function list(bucket) {
  return new Promise(function (resolve, reject) {
    s3.listObjectsV2({
      Bucket: bucket
    }, function (err, data) {
      if (err) {
        console.error('Error listing objects: ' + bucket);
        return reject(err);
      } else {
        resolve(data.Contents);
      }
    });
  });
}