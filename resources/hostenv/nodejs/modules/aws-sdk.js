
function DocumentClient() {}

DocumentClient.prototype.update = function (params_obj, callback) {
    TAJS_NOT_IMPLEMENTED('documentclient update')
};
DocumentClient.prototype.put = function (params_obj, callback) {
    TAJS_NOT_IMPLEMENTED('documentclient put')
};
DocumentClient.prototype.scan = function (params_obj, callback) {
    TAJS_NOT_IMPLEMENTED('documentclient scan')
};
DocumentClient.prototype.get = function (params_obj, callback) {
    TAJS_NOT_IMPLEMENTED('documentclient get')
};
DocumentClient.prototype.query = function (params_obj, callback) {
    TAJS_NOT_IMPLEMENTED('documentclient query')
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



module.exports = {
    DynamoDB: DynamoDB,
    SES: SES,
    S3: S3
};