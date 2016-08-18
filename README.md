# Roadwork Authentication
## General
This library adds Authentication supports to the Roadwork library. Note that this will automatically add 2 tables to your database called `user` and `user_session`:

```sql
CREATE TABLE user
(
    id INT(10) unsigned PRIMARY KEY NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255) DEFAULT '',
    last_name VARCHAR(255) DEFAULT '',
    scope VARCHAR(255) DEFAULT 'user' NOT NULL,
    avatar_url VARCHAR(255) DEFAULT '/images/avatar.png' NOT NULL,
    email_verified TINYINT(1) DEFAULT '0' NOT NULL COMMENT 'Is the user verified and can he/she login?',
    email_verify_key VARCHAR(255) DEFAULT '' NOT NULL,
    email_date_sent VARCHAR(255) DEFAULT '0000-00-00 00:00:00' NOT NULL,
    forgot_password_token VARCHAR(255),
    created_at DATETIME DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
    updated_at DATETIME
);

CREATE TABLE user_session
(
    id INT(10) unsigned PRIMARY KEY NOT NULL,
    user_id INT(10) unsigned NOT NULL,
    token VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip VARCHAR(255),
    created_at DATETIME DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
    updated_at DATETIME,
    CONSTRAINT user_session_user_id_foreign FOREIGN KEY (user_id) REFERENCES user (id)
);
CREATE UNIQUE INDEX user_session_token_unique ON user_session (token);
CREATE INDEX user_session_user_id_foreign ON user_session (user_id);
```

The reason that it does this is so that we are able to provide the following features:
* Add ACL to the main roadwork library
    * Allows us to specify which roles can access which routes
    * Adds the **$owner** dynamic role which only allows access to a route if the user owns the resource behind it
* Add bearerAuthentication so that we can login with a session token and access a route if a role is specified

## Usage
1. `npm install roadwork-authentication --save`
2. Install the database connector:
```
npm install pg --save
npm install mysql --save
npm install mariasql --save
npm install sqlite3 --save
```
3. Enable authentication in the main roadwork library: `roadwork.addAuthentication(require('roadwork-authentication'), dbConfig)`

> Note: the `addAuthentication` call is a promise that will be resolved. This is needed since it will check if the required tables and columns exist and will create them when needed.  

## API
### constructor(server, dbConfig)
Initiates the object with the server object and configuration to connect to the database. The database connection looks like this:

```
"database": {
    "connection": {
        "host": "127.0.0.1",
        "port": 3306,
        "user": "root",
        "password": "root",
        "database": "roadwork-example"
    },
    "client": "mysql",
    "pool": {
        "min": 2,
        "max": 10
    }
}
```

with the following available clients:

```
npm install pg --save
npm install mysql --save
npm install mariasql --save
npm install sqlite3 --save
```

### createRequiredTables()
Check if the required tables and columns exist and create them if needed. This returns a promise since it happens async

### getStrategyName() 
Returns the strategyName that we will use to register the route authentication strategy with