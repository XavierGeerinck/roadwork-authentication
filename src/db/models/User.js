var bcrypt = require('bcrypt');
var ITERATIONS = 10;

module.exports = function (Bookshelf) {
    if (!Bookshelf.Model) {
        return;
    }

    var UserBase = Bookshelf.Model.extend({
        tableName: 'user',
        hasTimestamps: true, // Define that we update the created_at and updated_at on change
        hidden: [ 'password', 'email_verify_key', 'forgot_password_token' ], // Fields to hide
        virtuals: { }, // Custom methods to retrieve special or merged data

        // On creation, hash the password
        initialize: function() {
            this.on('creating', this.hashPassword, this);
        },

        hashPassword: function (model, attrs, options) {
            return new Promise(function (resolve, reject) {
                if (options.is_plain_password) {
                    return resolve(model.attributes.password);
                }

                // Don't hash password if the user is logged in with a social provider
                if (model.attributes.id_social) {
                    return resolve();
                }

                bcrypt.hash(model.attributes.password, ITERATIONS, function (err, hash) {
                    if (err) {
                        return reject(err);
                    }

                    model.set('password', hash);

                    return resolve(hash);
                });
            });
        },
        sessions: function () {
            return this.hasMany('UserSession');
        }
    });

    return Bookshelf.model('UserBase', UserBase);
};