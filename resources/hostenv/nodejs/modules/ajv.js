

function AJV() {}


AJV.prototype.validate = function () {
    return TAJS_make('AnyBool');
};


AJV.prototype.addSchema =function () {

};

AJV.prototype.errorsText = function () {
    return TAJS_make('AnyStr');
};


module.exports = AJV;