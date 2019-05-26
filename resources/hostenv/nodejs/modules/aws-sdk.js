
function DocumentClient() {}

DocumentClient.prototype.update = function (params_obj, callback) {
    TAJS_serverless('dynamo_update', params_obj.TableName);

    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    callback(err);
};
DocumentClient.prototype.put = function (params_obj, callback) {
    TAJS_serverless('dynamo_put', params_obj.TableName);

    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    callback(err);
};
DocumentClient.prototype.scan = function (params_obj, callback) {
    TAJS_serverless('dynamo_scan', params_obj.TableName);

    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    var rows = { Items: [TAJS_join(TAJS_make('Undef'), TAJS_make('AnyStr'))] };
    if (callback) {
        callback(err, rows);
    }
    return { promise: function() { return Promise.resolve(rows) }};
};
DocumentClient.prototype.get = function (params_obj, callback) {
    TAJS_serverless('dynamo_get', params_obj.TableName);

    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    var rows = { Items: [TAJS_join(TAJS_make('Undef'), TAJS_make('AnyStr'))] };
    if (callback) {
        callback(err, rows);
    }
    return { promise: function() { return Promise.resolve(rows) }};
};
DocumentClient.prototype.query = function (params_obj, callback) {
    TAJS_serverless('dynamo_query', params_obj.TableName);

    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    var rows = { Items: [TAJS_join(TAJS_make('Undef'), TAJS_make('AnyStr'))] };
    if (callback) {
        callback(err, rows);
    }
    return { promise: function() { return Promise.resolve(rows) }};
};
DocumentClient.prototype.delete = function (params_obj, callback) {
    TAJS_serverless('dynamo_delete', params_obj.TableName);

    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    if (callback) {
        callback(err);
    }
};


function S3() {}
S3.prototype.getObject = function (params_obj, callback) {
    TAJS_serverless('s3_get', params_obj.Bucket);
    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    var data = { Body: TAJS_make('AnyStr')};
    if (callback) {
        callback(err, data)
    }
};
S3.prototype.listObjectsV2 = function (params_obj, callback) {
    TAJS_serverless('s3_list', params_obj.Bucket);
    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    var data = { Contents: TAJS_make('AnyStr')};
    if (callback) {
        callback(err, data)
    }
};
S3.prototype.putObject = function (params_obj, callback) {
    TAJS_serverless('s3_put', params_obj.Bucket);
    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    var data = { Body: TAJS_make('AnyStr')};
    if (callback) {
        callback(err, data)
    }
};
S3.prototype.copyObject = function (params_obj, callback) {
    TAJS_NOT_IMPLEMENTED('s3 copyObject')
};


function SES() {}
SES.prototype.sendEmail = function (params, callback) {
    TAJS_NOT_IMPLEMENTED('SES sendEmail')
};


var DynamoDB = {
  DocumentClient: DocumentClient
};


function Kinesis() {}

Kinesis.prototype.putRecord = function (params, callback) {
    TAJS_serverless('kinesis_put', params.StreamName);

    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    var resp = { Items: [TAJS_join(TAJS_make('Undef'), TAJS_make('AnyStr'))] };
    callback(err, resp);
};


function Lambda() {}
Lambda.prototype.invoke = function (params, callback) {
    TAJS_serverless('lambda_invoke', params.FunctionName);
    callback();
};

module.exports = {
    DynamoDB: DynamoDB,
    SES: SES,
    S3: S3,
    Kinesis: Kinesis,
    Lambda: Lambda
};