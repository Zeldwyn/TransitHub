//database.js
const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'transithub'
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to the Database');
    const createTableQueries = [
        `
        CREATE TABLE IF NOT EXISTS premiumUser (
            premiumUserID INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) NOT NULL,
            firstName VARCHAR(50) NOT NULL,
            lastName VARCHAR(50) NOT NULL,
            password VARCHAR(100) NOT NULL,
            userType VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS owner (
            ownerID INT AUTO_INCREMENT PRIMARY KEY,
            premiumUserID INT,
            FOREIGN KEY (premiumUserID) REFERENCES premiumUser(premiumUserID)
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS operator (
            operatorID INT AUTO_INCREMENT PRIMARY KEY,
            ownerID INT,
            premiumUserID INT,
            FOREIGN KEY (premiumUserID) REFERENCES premiumUser(premiumUserID),
            FOREIGN KEY (ownerID) REFERENCES owner(ownerID)
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS invites (
            inviteID INT AUTO_INCREMENT PRIMARY KEY,
            status VARCHAR (10) NOT NULL,
            ownerID INT,
            operatorID INT,
            FOREIGN KEY (ownerID) REFERENCES owner(ownerID),
            FOREIGN KEY (operatorID) REFERENCES operator(operatorID)
        ) 
        `,
        `
        CREATE TABLE IF NOT EXISTS guestUser (
            guestID INT AUTO_INCREMENT PRIMARY KEY,
            deviceID VARCHAR (100) NOT NULL
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS transaction (
            transactionID INT AUTO_INCREMENT PRIMARY KEY,
            toLocation VARCHAR (50) NOT NULL,
            fromLocation VARCHAR (50) NOT NULL,
            status VARCHAR (50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            guestID INT,
            FOREIGN KEY (guestID) REFERENCES guestUser(guestID)
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS guestUser (
            guestID INT AUTO_INCREMENT PRIMARY KEY,
            deviceID VARCHAR (100) NOT NULL
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS conversation (
            conversationID INT AUTO_INCREMENT PRIMARY KEY,
            ownerID INT,
            operatorID INT,
            FOREIGN KEY (ownerID) REFERENCES owner(ownerID),
            FOREIGN KEY (operatorID) REFERENCES operator(operatorID)
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS message (
            conversationID INT PRIMARY KEY,
            ownerID INT,
            operatorID INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversationID) REFERENCES conversation(conversationID)
        )
        `,
        `
        CREATE OR REPLACE VIEW InviteView AS
            SELECT pu.firstName, pu.lastName, pu.email, i.status, i.ownerID, i.operatorID, pu.premiumUserID
            FROM premiumUser pu
            JOIN operator o ON pu.premiumUserID = o.premiumUserID
            JOIN invites i ON o.operatorID = i.operatorID;         
        `
          
    ];    
    
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database:', err);
            return;
        }
        console.log('Connected to the Database');
        createTableQueries.forEach(query => {
            connection.query(query, (err, results) => {
                if (err) {
                    console.error('Error creating table:', err);
                } else {
                    console.log('Table created successfully');
                }
            });
        });
    
        connection.release();
    }); 
});

module.exports = pool.promise();
// `
// CREATE PROCEDURE LinkPremiumToOwner(IN pUserID INT)
// BEGIN
//     INSERT INTO owner (premiumUserID)
//     VALUES (pUserID);
// END 
// `,
// `
// CREATE PROCEDURE LinkPremiumToOperator(IN pUserID INT)
// BEGIN
//     INSERT INTO operator (premiumUserID)
//     VALUES (pUserID);
// END 
// `