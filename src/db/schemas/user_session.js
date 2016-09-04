module.exports = {
    id: { type: 'increments', nullable: false, primary: true },
    user_id: { references: 'id', inTable: 'user', type: 'integer', unsigned: true, nullable: false, onDelete: 'cascade' },
    token: { type: 'string', unique: true, nullable: false },
    user_agent: { type: 'text', nullable: true },
    ip: { type: 'string', nullable: true },
    created_at: { type: 'dateTime', nullable: false, defaultTo: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'dateTime', nullable: true }
};