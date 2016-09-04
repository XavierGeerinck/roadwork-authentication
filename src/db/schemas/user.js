module.exports = {
    id: { type: 'increments', nullable: false, primary: true },
    id_social: { type: 'string', nullable: true, compoundUniqueKey: true, comment: 'When a user logs in with a social medium (facebook/twitter/...) then this id is set and we use this instead of password!' },
    email: { type: 'string', compoundUniqueKey: true, nullable: false },
    password: { type: 'string', nullable: true },
    first_name: { type: 'string', nullable: false },
    middle_name: { type: 'string', nullable: true, defaultTo: "" },
    last_name: { type: 'string', nullable: true, defaultTo: "" },
    scope: { type: 'string', nullable: false, defaultTo: 'user' },
    avatar_url: { type: 'string', nullable: false, defaultTo: '/images/avatar.png' },
    is_verified: { type: 'boolean', defaultTo: false, nullable: false, comment: 'Is the user verified and can he/she login?' },
    email_verify_key: { type: 'string', nullable: false, defaultTo: '' },
    email_date_sent: { type: 'string', nullable: false, defaultTo: '0000-00-00 00:00:00' },
    forgot_password_token: { type: 'string', nullable: true },
    created_at: { type: 'dateTime', nullable: false, defaultTo: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'dateTime', nullable: true }
};
