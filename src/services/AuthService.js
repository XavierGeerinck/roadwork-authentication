'use strict';

const Promise = require('bluebird');
const Boom = require('boom');
const bcrypt = require('bcrypt');

class AuthService {
    constructor (models) {
        this.models = models;
        this.userSessionService = require('./UserSessionService')(models);
        this.userService = require('./UserService')(models);
    }

    /**
     * Returns isMatch (true if correct, false if not correct)
     * @param  {string} plain
     * @param  {string} hash
     */
    comparePassword (plain, hash) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(plain, hash, (err, res) => {
                if (err) {
                    return reject(err);
                }

                return resolve(res);
            });
        });
    }

    /**
     * Authorizes the user using email/password authentication
     * @param email
     * @param password
     * @param ip
     * @param userAgent
     * @returns {user: {}, token: "token"} if correctly authenticated
     */
    authorize (email, password, ip, userAgent) {
        let self = this;

        return new Promise((resolve, reject) => {
            let userObject;

            this.models.UserModel
            .where({ email: email })
            .fetch()
            .then((user) => {
                if (!user) {
                    return reject(Boom.unauthorized('USER_NOT_FOUND'));
                }

                // if (!user.get('is_verified')) {
                //     return reject(Boom.unauthorized('USER_NOT_VERIFIED'));
                // }

                if (user.get('id_social')) {
                    return reject(Boom.unauthorized('IS_SOCIAL_ACCOUNT'));
                }

                userObject = user;

                return self.comparePassword(password, user.get('password'));
            })
            .then((isMatch) => {
                if (!isMatch) {
                    return reject(Boom.unauthorized('INVALID_CREDENTIALS'));
                }

                return this.userSessionService.createSession(userObject, ip, userAgent);
            })
            .then((userSession) => {
                return resolve({
                    token: userSession.get('token'),
                    user: userObject
                });
            })
            .catch((err) => {
                return reject(Boom.badRequest(err));
            });
        });
    }

    logout (token) {
        var self = this;

        return new Promise((resolve, reject) => {
            self.models.UserSessionModel
            .where({ token: token })
            .destroy()
            .then(() => {
                return resolve();
            })
            .catch((err) => {
                return reject(err);
            });
        });
    }

    handleSocialLogin (socialId, email, firstName, middleName, lastName, avatarUrl, ip, userAgent) {
        return new Promise((resolve, reject) => {
            // Check if user exists
            this.userService.getUserBySocialId(socialId)
            .then((user) => {
                // User does not exist, create
                if (!user) {
                    return this.userService.createSocialUser(email, socialId, firstName, middleName, lastName, avatarUrl, ip, userAgent);
                }

                // Else user exists
                return Promise.resolve(user);
            })
            .then((user) => {
                return this.userSessionService.createSession(user, ip, userAgent);
            })
            .then((userSession) => {
                return resolve(userSession);
            })
            .catch((error) => {
                return reject(error);
            });
        });
    }
}

module.exports = (models) => {
    return new AuthService(models);
};