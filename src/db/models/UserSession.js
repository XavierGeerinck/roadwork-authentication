module.exports = function (Bookshelf) {
    if (!Bookshelf.Model) {
        return;
    }

    var UserSessionBase = Bookshelf.Model.extend({
        tableName: 'user_session',
        hasTimestamps: true, // Define that we update the created_at and updated_at on change
        user: function () {
            return this.belongsTo('UserBase');
        }
    });

    return Bookshelf.model('UserSessionBase', UserSessionBase);
};
