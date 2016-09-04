/**
 * This file will initialize the database and it's tables
 */
var Promise = require('bluebird');
var async = require('async');
var fs = require('fs');

exports.columnsExist = function (knex, tableName, columns) {
    return Promise.each(columns, (column) => {
        exports.columnExists(knex, tableName, column)
        .then((exists) => {
            if (exists) {
                return Promise.resolve();
            }

            return Promise.reject('Missing column: ' + column + ' for the user table');
        });
    });
};

exports.columnExists = function (knex, tableName, columnName) {
    return knex.schema.hasColumn(tableName, columnName);
};

exports.createTableByScheme = function (knex, scheme, tableName) {
    // And create a table for each one
    return knex.schema.createTable(tableName, function (table) {
        // Init vars for the columnkeys
        var column;
        var columnKeys = Object.keys(scheme);
        var compoundUniqueKeys = [];
        var compoundPrimaryKeys = [];

        // For each columnkey, add it to the column definition
        columnKeys.forEach(function (key) {
            // Set the currentKey
            var currentKey = scheme[key];

            // Type handler
            if (currentKey.type === "text" && currentKey.hasOwnProperty("fieldtype")) {
                column = table[currentKey.type](key, currentKey.fieldtype);
            } else if (currentKey.type === "string" && currentKey.hasOwnProperty("maxlength")) {
                column = table[currentKey.type](key, currentKey.maxlength);
            } else {
                column = table[currentKey.type](key);
            }

            // Nullable handler
            if (currentKey.hasOwnProperty("nullable") && currentKey.nullable === true) {
                column.nullable();
            } else {
                column.notNullable();
            }

            // Primary key constraint
            if (currentKey.hasOwnProperty("primary") && currentKey.primary === true) {
                column.primary();
            }

            // Unique constraint
            if (currentKey.hasOwnProperty("unique") && currentKey.unique === true) {
                column.unique();
            }

            // Is unsigned
            if (currentKey.hasOwnProperty("unsigned") && currentKey.unsigned === true) {
                column.unsigned();
            }

            // FK constraint
            if (currentKey.inTable && currentKey.hasOwnProperty("references")) {
                column.references(currentKey.inTable + '.' + currentKey.references);
            } else if (currentKey.hasOwnProperty("references")) {
                column.references(currentKey.references);
            }

            // onDelete
            // Example: Used on foreign key, onDelete: cascade
            if (currentKey.hasOwnProperty("onDelete")) {
                column.onDelete(currentKey.onDelete);
            }

            // Default value
            if (currentKey.hasOwnProperty("defaultTo")) {
                if (currentKey.defaultTo == 'CURRENT_TIMESTAMP') {
                    // http://knexjs.org/#Schema-timestamp
                    column.defaultTo(knex.fn.now());
                } else {
                    column.defaultTo(currentKey.defaultTo);
                }
            }

            // Comment meta data
            if (currentKey.hasOwnProperty('comment')) {
                column.comment(currentKey.comment);
            }

            // Add compound primary key
            if (currentKey.hasOwnProperty('compoundPrimaryKey')) {
                compoundPrimaryKeys.push(key);
            }

            // Add compound unique key
            if (currentKey.hasOwnProperty('compoundUniqueKey')) {
                compoundUniqueKeys.push(key);
            }
        });

        // Add compound key
        if (compoundPrimaryKeys.length > 0) {
            table.primary(compoundPrimaryKeys);
        }

        if (compoundUniqueKeys.length > 0) {
            table.unique(compoundUniqueKeys);
        }
    });
};