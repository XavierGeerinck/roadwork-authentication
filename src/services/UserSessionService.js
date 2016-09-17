'use strict';

const stringUtil = require('roadwork-utils').string;

class UserSessionService {
    constructor (models) {
        this.models = models;
    }

    createSession (userModelObject, ip, userAgent) {
        let token = stringUtil.createBearerToken();

        return this.models.UserSessionModel.forge({
            user_id: userModelObject.get('id'),
            token: token,
            user_agent: userAgent,
            ip: ip
        })
        .save();
    }
}

module.exports = (models) => {
    return new UserSessionService(models);
};