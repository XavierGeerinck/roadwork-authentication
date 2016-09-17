'use strict';

const Boom = require('boom');

class AuthController {
    constructor (models) {
        this.models = models;

        this.authService = require('../services/AuthService')(models);
        this.errorService = require('../services/ErrorService');
    }

    logout (request, reply) {
        if (!request.headers.authorization && !request.query.access_token) {
            return reply(Boom.badRequest('INVALID_TOKEN'));
        }

        // Passed as "Bearer <token>" so get <token>
        let token = request.query.access_token || "";

        if (request.headers.authorization) {
            token = request.headers.authorization.split(' ')[1];
        }

        this.authService.logout(token)
        .then(function () {
            return reply({ success: true });
        }).catch(function (err) {
            return reply(this.errorService.handleError(err));
        });
    }

    authorize (request, reply) {
        let self = this;
        let email = request.payload.email;
        let password = request.payload.password;
        let userAgent = request.headers['user-agent'];
        let ip = request.headers['X-Forwarded-For'] || request.info.remoteAddress;

        this.authService.authorize(email, password, ip, userAgent)
        .then((userSession) => {
            return reply(userSession);
        })
        .catch((err) => {
            return reply(this.errorService.handleError(err));
        });
    }
}

module.exports = function (models) {
    return new AuthController(models);
};

// TODO: Implement the social login
// exports.authorizeFacebook = function (request, reply) {
//     // Perform any account lookup or registration, setup local session,
//     // and redirect to the application. The third-party credentials are
//     // stored in request.auth.credentials. Any query parameters from
//     // the initial request are passed back via request.auth.credentials.query.
//     if (!request.auth.isAuthenticated) {
//         return reply('NOT_AUTHENTICATED');
//     }
//
//     var redirectUri = request.auth.credentials.query.redirect_uri;
//
//     // Set params
//     var socialId = request.auth.credentials.profile.id; // Use id as main authentication and allow for manual email setting, it can be undefined!
//     var email = request.auth.credentials.profile.email || socialId + '@facebook.com';
//     var firstName = request.auth.credentials.profile.name ? request.auth.credentials.profile.name.first || "" : "";
//     var middleName = request.auth.credentials.profile.name ? request.auth.credentials.profile.name.middle || "" : "";
//     var lastName = request.auth.credentials.profile.name ? request.auth.credentials.profile.name.last || "" : "";
//     var avatarUrl = 'https://graph.facebook.com/' + request.auth.credentials.profile.id + '/picture';
//     var userAgent = request.headers['user-agent'];
//     var ip = request.headers['X-Forwarded-For'] || request.info.remoteAddress;
//
//     AuthService.handleSocialLogin(socialId, email, firstName, middleName, lastName, avatarUrl, ip, userAgent)
//         .then(function (userSession) {
//             // On login, redirect to the page we came from, that way we can fetch our token from the url
//             return reply.redirect(redirectUri + '/?result=' + JSON.stringify({
//                     token: userSession.get('token'),
//                     facebook_token: request.auth.credentials.token
//                 }));
//         })
//         .catch(function (err) {
//             console.error(err);
//             return reply.redirect(redirectUri + '/nl_BE/?error=' + err);
//         });
// };
//
// exports.authorizeTwitter = function (request, reply) {
// // Perform any account lookup or registration, setup local session,
//     // and redirect to the application. The third-party credentials are
//     // stored in request.auth.credentials. Any query parameters from
//     // the initial request are passed back via request.auth.credentials.query.
//     if (!request.auth.isAuthenticated) {
//         return reply('NOT_AUTHENTICATED');
//     }
//
//     var redirectUri = request.auth.credentials.query.redirect_uri;
//
//     // Set params
//     var socialId = request.auth.credentials.profile.id; // Use id as main authentication and allow for manual email setting, it can be undefined!
//     var email = request.auth.credentials.profile.email || socialId + '@twitter.com'; // For twitter we need to be whitelisted (https://dev.twitter.com/rest/reference/get/account/verify_credentials)
//
//     var name = request.auth.credentials.profile.raw.name.split(" ");
//     var firstName = name ? name[0] || "" : "";
//     var middleName = name.splice(1, name.length - 2) ? name.splice(1, name.length - 2).join(" ") : "";
//     var lastName = name.length > 1 ? name[name.length - 1] || "" : "";
//
//     var avatarUrl = request.auth.credentials.profile.raw.profile_image_url_https;
//     var userAgent = request.headers['user-agent'];
//     var ip = request.headers['X-Forwarded-For'] || request.info.remoteAddress;
//
//     AuthService.handleSocialLogin(socialId, email, firstName, middleName, lastName, avatarUrl, ip, userAgent)
//         .then(function (userSession) {
//             // On login, redirect to the page we came from, that way we can fetch our token from the url
//             return reply.redirect(redirectUri + '/?result=' + JSON.stringify({
//                     token: userSession.get('token'),
//                     twitter_token: request.auth.credentials.token,
//                     twitter_secret: request.auth.credentials.secret
//                 }));
//         })
//         .catch(function (err) {
//             console.error(err);
//             return reply.redirect(redirectUri + '/nl_BE/?error=' + err);
//         });
// };
