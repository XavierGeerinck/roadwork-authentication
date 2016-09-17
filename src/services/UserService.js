'use strict';

// const Boom = require('boom');

class UserService {
    constructor (models) {
        this.models = models;
    }

    createSocialUser (email, socialId, firstName, middleName, lastName, avatarUrl) {
        return this.models.UserModel.forge({
            id_social: socialId,
            email: email,
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            scope: 'user',
            avatar_url: avatarUrl
        })
        .save();
    }

    getUserBySocialId (socialId) {
        return this.models.UserModel.where({ id_social: socialId }).fetch();
    }
}

module.exports = (models) => {
    return new UserService(models);
};

// TODO: To be removed, currently still here to get the functionality in the core lib
// exports.create = function (email, password, firstName, middleName, lastName) {
//     return new Promise(function (resolve, reject) {
//         if (password.length < 5) {
//             return reject(Boom.badRequest('PASSWORD_TOO_SHORT'));
//         }
//
//         exports.getUserByEmail(email)
//         .then(function (user) {
//             if (user) {
//                 return reject(Boom.badRequest('USER_ALREADY_EXISTS'));
//             }
//
//             return UserModel.forge({
//                 email: email,
//                 password: password,
//                 first_name: firstName,
//                 middle_name: middleName,
//                 last_name: lastName,
//                 scope: 'user'
//             })
//                 .save();
//         })
//         .then(function (user) {
//             return resolve(user);
//         });
//     });
// };
// exports.getUserByEmail = function (email) {
//     return UserModel.where({ email: email }).fetch();
// };
//
// exports.getUserById = function (id) {
//     return UserModel.where({ id: id }).fetch();
// };