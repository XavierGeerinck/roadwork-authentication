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
 */
RoadworkAuthentication.prototype.validateFunction = function (token, callback) {
    // The object request
    const request = this;

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
    var HapiInterface = require('./adapters/hapi-interface');
    var hapiInterface = new HapiInterface(this.server, this.strategyName, this.validateFunction);
    var self = this;

    var register = (server, options, next) => {
        server.auth.scheme(this.strategyName, (server, options) => {
            return {
                authenticate: self.validateBearerToken
            }
        });

        return next();
    };

    register.attributes = {
        pkg: require(process.cwd() + '/package.json')
    };

    return register;

    return require('./adapters/hapi-interface');
    //return require('hapi-auth-bearer-token');
};

RoadworkAuthentication.prototype.validateBearerToken = (request, reply) => {
    var self = this;

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
};

var internals = {};
internals.validateCallback = (err, isValid, credentials, token, reply) => {
    credentials = credentials || null;

    if (err) {
        return reply(err, null, { credentials });
    }

    if (!isValid) {
        return reply(Boom.unauthorized(null, this.strategyName, {
            isValid,
            credentials
        }), null, { credentials });
    }

    if (!credentials ||
        typeof credentials !== 'object') {

        return reply(Boom.badImplementation('Bad credentials object received for bearerAuth auth validation'));
    }

    credentials.token = token;

    return reply.continue({
        credentials
    });
};

module.exports = RoadworkAuthentication;
