// Load modules
const pluralize = require('pluralize');
const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const sinon = require('sinon');

// Define shortcuts
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const beforeEach = lab.beforeEach;
const after = lab.after;
const expect = Code.expect;

const server = require('./helpers/server-hapi').init();
const RoadWorkAuthentication = require('..');

describe('Module', () => {
    before((done) => {
        done();
    });

    it('should return an error if no server object was passed', (done) => {
        try {
            const Api = new RoadWorkAuthentication();
        } catch (err) {
            expect(err.message).to.equal('Missing the http engine');
        }

        done();
    });

    it('should return an error if no dbConfig object was passed', (done) => {
        try {
            const Api = new RoadWorkAuthentication(server);
        } catch (err) {
            expect(err.message).to.equal('Missing the bookshelf object');
        }

        done();
    });

    it('should return the strategyName when asked', (done) => {
        const Api = new RoadWorkAuthentication(server, {});
        expect(Api.strategyName).to.equal('roadwork-authentication-bearer');

        done();
    });

    describe('validateBearerToken', () => {
        // Start testing bearer plugin
        it('should use the authorization header if it is set', (done) => {
            let Api = new RoadWorkAuthentication(server, {});

            // Create a mock for the validateFunction that will always return true
            let validateStub = sinon.stub(Api, 'validateFunction');
            validateStub.yields(null, true, {email: 'success@local.com', password: 'success'}); // (err, isValid, credentials)

            const request = {
                headers: {
                    authorization: 'Bearer SOME_VALID_TOKEN'
                },
                query: {}
            };

            Api.validateBearerToken(request.headers, request.query, (err, credentials) => {
                expect(err).to.not.exist();
                expect(credentials).to.exist();
                expect(credentials.token).to.equal(request.headers.authorization.split(' ')[1]);

                validateStub.restore();
                done();
            });
        });

        it('should return unauthorized when the bearer token is not set but the Authorization header exists', (done) => {
            let Api = new RoadWorkAuthentication(server, {});

            const request = {
                headers: {
                    authorization: 'Invalid SOME_VALID_TOKEN'
                },
                query: {}
            };

            Api.validateBearerToken(request.headers, request.query, (err, credentials) => {
                expect(err.message).to.equal('Unauthorized');
                expect(credentials).to.not.exist();
                done();
            });
        });

        it('should use the query parameter if it is set', (done) => {
            let Api = new RoadWorkAuthentication(server, {});

            // Create a mock for the validateFunction that will always return true
            let validateStub = sinon.stub(Api, 'validateFunction');
            validateStub.yields(null, true, {email: 'success@local.com', password: 'success'}); // (err, isValid, credentials)

            const request = {
                headers: {},
                query: {
                    access_token: 'SOME_VALID_TOKEN'
                }
            };

            Api.validateBearerToken(request.headers, request.query, (err, credentials) => {
                expect(err).to.not.exist();
                expect(credentials).to.exist();
                expect(credentials.token).to.equal(request.query.access_token);

                validateStub.restore();
                done();
            });
        });

        it('should return unauthorized when the bearer token and query token is not set', (done) => {
            let Api = new RoadWorkAuthentication(server, {});

            const request = {
                headers: {},
                query: {}
            };

            Api.validateBearerToken(request.headers, request.query, (err, credentials) => {
                expect(err.message).to.equal('Unauthorized');
                expect(credentials).to.not.exist();
                done();
            });
        });

        it('should use the query parameter before the authorization header if both are set', (done) => {
            let Api = new RoadWorkAuthentication(server, {});

            // Create a mock for the validateFunction that will always return true
            let validateStub = sinon.stub(Api, 'validateFunction');
            validateStub.yields(null, true, {email: 'success@local.com', password: 'success'}); // (err, isValid, credentials)

            const request = {
                headers: {
                    authorization: 'Bearer SOME_VALID_TOKEN1'
                },
                query: {
                    access_token: 'SOME_VALID_TOKEN2'
                }
            };

            Api.validateBearerToken(request.headers, request.query, (err, credentials) => {
                expect(err).to.not.exist();
                expect(credentials).to.exist();
                expect(credentials.token).to.equal(request.query.access_token);

                validateStub.restore();
                done();
            });
        });
    });

    describe('validateCallback', () => {
        // RoadworkAuthentication.prototype.validateCallback = function (err, isValid, credentials, token, callback) {
        it('should return an error and the credentials if an error is passed', (done) => {
            let Api = new RoadWorkAuthentication(server, {});
            Api.validateCallback('some_err', null, { email: 'test' }, null, (err, credentials) => {
                expect(err).to.exist();
                expect(err).to.equal('some_err');
                expect(credentials).to.equal({ email: 'test' });
                done();
            });
        });

        it('should return unauthorized when isValid = false', (done) => {
            let Api = new RoadWorkAuthentication(server, {});
            Api.validateCallback(null, false, { email: 'test' }, null, (err, credentials) => {
                expect(err).to.exist();
                expect(err.message).to.equal('Unauthorized');
                expect(credentials).to.equal({ email: 'test' });
                done();
            });
        });

        it('should return badImplementation if the credentials object is not set', (done) => {
            let Api = new RoadWorkAuthentication(server, {});
            Api.validateCallback(null, true, null, null, (err, credentials) => {
                expect(err).to.exist();
                expect(err.message).to.equal('Bad credentials object received for bearerAuth auth validation');
                expect(credentials).to.not.exist();
                done();
            });
        });

        it('should return badImplementation if the credentials object is not an object', (done) => {
            let Api = new RoadWorkAuthentication(server, {});
            Api.validateCallback(null, true, 'invalid', null, (err, credentials) => {
                expect(err).to.exist();
                expect(err.message).to.equal('Bad credentials object received for bearerAuth auth validation');
                expect(credentials).to.not.exist();
                done();
            });
        });
    });
});