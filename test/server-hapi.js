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

    it('should return the correct hapi interface for plugin registration', (done) => {
        let Api = new RoadWorkAuthentication(server, {});

        let interfaceVar = Api.getHapiFrameworkInterface();
        expect(typeof(interfaceVar)).to.equal('function');
        expect(interfaceVar.attributes).to.exist();
        expect(interfaceVar.attributes.pkg).to.exist();

        done();
    });

    it('should correctly register it in the hapi framework', (done) => {
        let Api = new RoadWorkAuthentication(server, {});
        server.register(Api.getHapiFrameworkInterface(), (err) => {
            expect(err).to.not.exist();

            done();
        });
    });

    //it('', (done) => {
    //    //
    //    //let Api = new RoadWorkAuthentication(server, {});
    //    //let interfaceVar = Api.getHapiFrameworkInterface();
    //    //
    //    //// server.auth.scheme
    //    //
    //    //// Create a mock for the validateFunction that will always return true
    //    //let stub = sinon.stub(server.auth, 'scheme');
    //    //validateStub.yields(); // (err, isValid, credentials)
    //    //
    //    //interfaceVar(server, {}, () => {
    //    //    stub.restore();
    //    //    done();
    //    //});
    //
    //
    //    //server.auth.scheme(this.strategyName, (server, options) => {
    //})
});