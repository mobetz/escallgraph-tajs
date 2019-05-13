

function AJV() {}


AJV.prototype.validate = function () {
    return TAJS_make('AnyBool');
};


AJV.prototype.addSchema =function () {

};

AJV.prototype.errorsText = function () {
    return TAJS_join(TAJS_make('Undef'), TAJS_make('AnyStr'));
};

AJV.prototype.getSchema = function () {
  return TAJS_make('AnyBool'); //TODO: unsafe for some usages of get schema, this will actually be an object from addSchema
};

module.exports = AJV;