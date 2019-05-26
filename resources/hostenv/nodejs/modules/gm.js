
function gm(imageData) {
    this.imageData = imageData;
    var self = this;
    this.compress = function(format) {
        return self;
    };

    this.resize = function(x, y) {
        return self;
    };

    this.rotate = function(color, degrees) {
        return self;
    };

    this.quality = function(amount) {
        return self;
    };

    this.toBuffer = function(format, cb) {
        cb(TAJS_make('AnyStr'))
    }
}


module.exports = {
  subClass: function (lib) {
      return function (buffer_in) { return new gm(buffer_in) };
  }
};