const Joi = require('joi');

module.exports = function (controller) {
    return [
        {
            // Note, we do not require authentication here, since we get the token from the header!
            method: 'GET',
            path: '/auth/logout',
            config: {
                handler: controller.logout.bind(controller)
            }
        },
        {
            method: 'POST',
            path: '/auth/authorize',
            handler: controller.authorize.bind(controller),
            config: {
                validate: {
                    payload: {
                        email: Joi.string().required(),
                        password: Joi.string().required()
                    }
                }
            }
        }
    ];
};
// TODO: Implement social provider logins
//,
// {
//     method: [ 'GET', 'POST' ],
//     path: '/auth/facebook',
//     handler: AuthController.authorizeFacebook,
//     config: {
//         auth: 'facebook'
//     }
// },
// {
//     method: [ 'GET', 'POST' ],
//     path: '/auth/twitter',
//     handler: AuthController.authorizeTwitter,
//     config: {
//         auth: 'twitter'
//     }
// }