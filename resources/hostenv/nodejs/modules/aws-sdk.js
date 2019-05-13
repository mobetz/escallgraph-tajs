
function DocumentClient() {}

DocumentClient.prototype.update = function (params_obj, callback) {
    TAJS_serverless('dynamo_update', params_obj.TableName);

    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    callback(err);
};
DocumentClient.prototype.put = function (params_obj, callback) {
    TAJS_NOT_IMPLEMENTED('documentclient put')
};
DocumentClient.prototype.scan = function (params_obj, callback) {
    TAJS_serverless('dynamo_scan', params_obj.TableName);

    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    var rows = { Items: [TAJS_join(TAJS_make('Undef'), TAJS_make('AnyStr'))] };
    callback(err, rows);
};
DocumentClient.prototype.get = function (params_obj, callback) {
    TAJS_NOT_IMPLEMENTED('documentclient get')
};
DocumentClient.prototype.query = function (params_obj, callback) {
    TAJS_serverless('dynamo_query', params_obj.TableName);

    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    var rows = { Items: [TAJS_join(TAJS_make('Undef'), TAJS_make('AnyStr'))] };
    callback(err, rows);
};
DocumentClient.prototype.delete = function (params_obj, callback) {
    TAJS_serverless('dynamo_delete', params_obj.TableName);

    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    callback(err);
};


function S3() {}
S3.prototype.getObject = function (params_obj, callback) {
    TAJS_NOT_IMPLEMENTED('s3 getObject')
};
S3.prototype.listObjectsV2 = function (params_obj, callback) {
    TAJS_NOT_IMPLEMENTED('s3 listObjects')
};
S3.prototype.putObject = function (params_obj, callback) {
    TAJS_NOT_IMPLEMENTED('s3 putObject')
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
    TAJS_serverless('kinesis_put', params.schema);

    var err = TAJS_join(TAJS_make('Undef'), TAJS_makeGenericError());
    var resp = { Items: [TAJS_join(TAJS_make('Undef'), TAJS_make('AnyStr'))] };
    callback(err, resp);
};


module.exports = {
    DynamoDB: DynamoDB,
    SES: SES,
    S3: S3,
    Kinesis: Kinesis
};