'use strict';

const Boom = require('boom');
const Hoek = require('hoek');

var HapiInterface = function (server, strategyName, validateFunction) {
    this.server = server;
    this.strategyName = strategyName;
    this.validateFunction = validateFunction;
};

HapiInterface.prototype.implementation = (server, options) => {
    //Hoek.assert(options, 'Missing bearerAuthentication strategy options');
    var self = this;
    const settings = Hoek.clone(options);

    return {
        authenticate: (server, request) => {
            let token = '';

            if (request.query.access_token) {
                token = request.query.access_token;
                delete request.query.access_token;
            }
            else if (request.headers.authorization && request.headers.authorization !== undefined) {
                const headerParts = request.headers.authorization.split(' ');

                if (headerParts[0].toLowerCase() !== 'bearer') {
                    return reply(Boom.unauthorized(null, this.strategyName));
                }

                token = headerParts[1];
            }
            else {
                return reply(Boom.unauthorized(null, this.strategyName), null, {});
            }

            // use provided validate function to return
            if (settings.exposeRequest) {
                return self.validateFunction.call(request, token, (err, isValid, credentials) => {
                    return internals.validateCallback(err, isValid, credentials, token, reply);
                });
            }

            return self.validateFunction(token, (err, isValid, credentials) => {
                return internals.validateCallback(err, isValid, credentials, token, reply);
            });
        }
    };
};



module.exports = HapiInterface;