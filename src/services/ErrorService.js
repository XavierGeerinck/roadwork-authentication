'use strict';

const Boom = require('boom');

class ErrorService {
    /**
     * Handles the errors returned in the catch statements, this way we do not expose too much
     * @param err
     */
    handleError (err) {
        console.error(err);

        if (err.code) {
            return Boom.badRequest(err.code);
        }

        // If it is a boom output already, return that
        if (err.isBoom) {
            return err;
        }

        return Boom.internal('UNKNOWN');
    }
}

module.exports = new ErrorService();