
function KinesisHandler(schema, module) {
    this.callbacks = [];

    this.registerSchemaMethodPair = function (schema, callback) {
        this.callbacks.push(callback);
    };

    var self = this;
    this.processKinesisEvent = {
        bind: function (kh) {
            return function (ev, callback) {
                self.callbacks.forEach(function (cb) {
                    cb(ev, callback);
                });
            }
        }
    };
}

module.exports = {
    KinesisHandler: KinesisHandler
};