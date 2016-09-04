const Boom = require('boom');
const pluralize = require('pluralize');

module.exports = function (roadworkAuthenticationScope) {
    var register = (server, options, next) => {
        /**
         * Create a onPreAuth hook, that will resolve the $owner role required into a user-<id> role required, depending on the requested object
         */
        server.ext('onPreAuth', (request, reply) => {
            // If no auth defined, continue
            if (!request.route.settings.auth) {
                return reply.continue();
            }

            var table = pluralize.singular(request.path.split('/')[1]);
            var rowId = request.path.split('/')[2];

            // If we found no rowId, then it means that it is a findAll or create call
            // These are special, since the findAll should then return all the routes that belong to a specific user
            // Whereas the $owner role on a create call is impossible (since no objects exist)
            if (!rowId) {
                reply.continue();
                return;
            }

            // Allow the table owner access
            roadworkAuthenticationScope.getTableRowOwner(table, rowId)
            .then((ownerId) => {
                if (!ownerId) {
                    // Return no resource http response
                    return reply(Boom.notFound());
                }

                // Add the dynamic role
                for (let i in request.route.settings.auth.access[0].scope.selection) {
                    if (request.route.settings.auth.access[0].scope.selection[i] !== '$owner') {
                        continue;
                    }

                    request.route.settings.auth.access[0].scope.selection[i] = 'user-' + ownerId;
                }

                // Current resolved $owner scope
                //console.log(request.route.settings.auth.access[0].scope.selection);

                // return reply
                reply.continue();
            });
        });

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
