const Boom = require('boom');
const pluralize = require('pluralize');

module.exports = function (roadworkAuthenticationScope) {
    var register = (server, options, next) => {
        server.auth.scheme(roadworkAuthenticationScope.strategyName, (server, options) => {
            return {
                authenticate: (request, reply) => {
                    const queryParams = request.query;
                    const headers = request.headers;

                    // Validate the bearer token for Hapi
                    roadworkAuthenticationScope.validateBearerToken(headers, queryParams, (err, credentials) => {
                        if (err) {
                            return reply(err);
                        }

                        return reply.continue({ credentials });
                    });
                }
            }
        });

        return next();
    };

    register.attributes = {
        pkg: require(process.cwd() + '/package.json')
    };

    return register;
};
