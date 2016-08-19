var Promise = require('bluebird');
var Boom = require('boom');

var RoadworkAuthentication = function (server, dbConfig) {
    if (!server) {
        throw new Error('Incorrect library');
    }

    if (!dbConfig) {
        throw new Error('Missing database connection configuration');
    }

    this.server = server;
    this.dbConfig = dbConfig;
    this.strategyName = 'roadwork-authentication-bearer';
};

RoadworkAuthentication.prototype.getStrategyName = function () {
    return this.strategyName;
};

/**
 * Check if we can connect to the database
 * @returns boolean
 */
RoadworkAuthentication.prototype.canConnect = function () {

};

/**
 * Connects to the database
 */
RoadworkAuthentication.prototype.connect = function () {

};

/**
 * Create the required tables for the library to function
 */
RoadworkAuthentication.prototype.createRequiredTables = function () {
    return new Promise(function (resolve, reject) {
        return resolve();
    });
};

/**
 * The validate function to be used to see if a user has access to a specific route
 * @param token
 * @param callback(err, isValid, credentials)
 */
RoadworkAuthentication.prototype.validateFunction = function (token, callback) {
    UserSessionModel
    .where({ token: token })
    .fetch()
    .then(function (userSession) {
        if (!userSession) {
            return Promise.reject(Boom.badRequest('INVALID_TOKEN'));
        }

        return UserModel.where({ id: userSession.get('user_id') }).fetch();
    })
    .then(function (user) {
        if (!user) {
            return Promise.reject(Boom.badRequest('INVALID_TOKEN'));
        }

        var userObj = user;
        userObj.scope = [ user.get('scope') ];

        return callback(null, true, userObj);
    })
    .catch(function (err) {
        return callback(err);
    });
};

RoadworkAuthentication.prototype.hasAccessToTable = function (userId, table) {
    return true;
};

/**
 * Create the implementation to be used in the hapi framework
 */
RoadworkAuthentication.prototype.getHapiFrameworkInterface = function () {
    //var HapiInterface = require('./adapters/hapi-interface');
    //var hapiInterface = new HapiInterface(this.server, this.strategyName, this.validateFunction);
    var self = this;

    var register = (server, options, next) => {
        server.auth.scheme(this.strategyName, (server, options) => {
            return {
                authenticate: (request, reply) => {
                    const queryParams = request.query;
                    const headers = request.headers;

                    // Validate the bearer token for Hapi
                    self.validateBearerToken(headers, queryParams, (err, credentials) => {
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

    // TODO: Put it in the adapter
    //return require('./adapters/hapi-interface');
};

/**
 * Validates the headers and queryParams its access_token. This can be passed in the header through:
 * Authorization: Bearer <token>
 *
 * or in the query through:
 * ?access_token=<token>
 *
 * the rules of parsing: QueryParameters > Authorization Header
 *
 * @param headers
 * @param queryParams
 * @param callback(err, credentialsObject)
 * @returns {*}
 */
RoadworkAuthentication.prototype.validateBearerToken = function (headers, queryParams, callback) {
    var self = this;

    let bearerToken = '';

    if (queryParams.access_token) {
        bearerToken = queryParams.access_token;
        //delete queryParams.access_token;
    }
    else if (headers.authorization && headers.authorization !== undefined) {
        const headerParts = headers.authorization.split(' ');

        if (headerParts[0].toLowerCase() !== 'bearer') {
            return callback(Boom.unauthorized(null, this.strategyName));
        }

        bearerToken = headerParts[1];
    }
    else {
        return callback(Boom.unauthorized(null, this.strategyName));
    }

    return self.validateFunction(bearerToken, (err, isValid, credentials) => {
        //console.log(err);
        //console.log(isValid);
        //console.log(credentials);
        return self.validateCallback(err, isValid, credentials, bearerToken, callback);
    });
};

RoadworkAuthentication.prototype.validateCallback = function (err, isValid, credentials, token, callback) {
    credentials = credentials || null;

    if (err) {
        return callback(err, credentials);
    }

    if (!isValid) {
        return callback(Boom.unauthorized(null, this.strategyName, {
            isValid,
            credentials
        }), credentials);
    }

    if (!credentials || typeof credentials !== 'object') {
        return callback(Boom.badImplementation('Bad credentials object received for bearerAuth auth validation'));
    }

    credentials.token = token;

    return callback(null, credentials);
};

module.exports = RoadworkAuthentication;
