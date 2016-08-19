var Hapi = require('hapi');

exports.init = function() {
    var server = new Hapi.Server({ debug: false });
    server.connection();
    return server;
};