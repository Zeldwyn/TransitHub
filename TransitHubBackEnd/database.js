//database.js
const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '1234',
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
            premiumUserID INT,
            FOREIGN KEY (premiumUserID) REFERENCES premiumUser(premiumUserID)
        )
        `,
       `CREATE TABLE IF NOT EXISTS operator_owner (
            operatorID INT,
            ownerID INT,
            FOREIGN KEY (operatorID) REFERENCES operator(operatorID),
            FOREIGN KEY (ownerID) REFERENCES owner(ownerID)
        )`     
        ,
        `
        CREATE TABLE IF NOT EXISTS transaction (
            transactionID INT AUTO_INCREMENT PRIMARY KEY,
            toCoords POINT NOT NULL,          -- Use POINT for latitude and longitude
            fromCoords POINT NOT NULL,        -- Use POINT for latitude and longitude
            packageWidth DECIMAL(10, 2) NOT NULL,
            packageHeight DECIMAL(10, 2) NOT NULL,
            packageWeight DECIMAL(10, 2) NOT NULL,
            first2km DECIMAL(10, 2) NOT NULL,
            succeedingKm DECIMAL(10, 2) NOT NULL,
            client VARCHAR(100) NOT NULL,
            distance DECIMAL(10, 2) NOT NULL,
            notes TEXT,
            date DATE NOT NULL,
            expectedDuration DECIMAL(10, 2),
            expectedFee DECIMAL(10, 2),
            finalFee DECIMAL(10, 2),
            status VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            premiumUserID INT,
            operatorID INT,
            FOREIGN KEY (premiumUserID) REFERENCES premiumUser(premiumUserID),
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
        CREATE TABLE IF NOT EXISTS transactionGuest (
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
            messageID INT AUTO_INCREMENT PRIMARY KEY,
            conversationID INT,
            ownerID INT,
            operatorID INT,
            userType VARCHAR(10),
            text VARCHAR(255),
            created_at TIMESTAMP,
            FOREIGN KEY (conversationID) REFERENCES conversation(conversationID),
            FOREIGN KEY (ownerID) REFERENCES owner(ownerID) ON DELETE CASCADE,
            FOREIGN KEY (operatorID) REFERENCES operator(operatorID) ON DELETE CASCADE
        )     
        `,
        `
        CREATE TABLE IF NOT EXISTS feedback (   
            feedbackID INT AUTO_INCREMENT PRIMARY KEY,
            feedbackMessage VARCHAR (500) NOT NULL,
            rate INT 
        )
        `,
        `
        CREATE OR REPLACE VIEW 
        operatorDetails AS SELECT p.firstName, p.lastName, p.email, o.operatorID 
        FROM premiumUser p 
        JOIN operator o ON p.premiumUserID = o.premiumUserID;    
        `,  
        `
        CREATE OR REPLACE VIEW 
        ownerDetails AS SELECT p.firstName, p.lastName, p.email, o.ownerID 
        FROM premiumUser p 
        JOIN owner o ON p.premiumUserID = o.premiumUserID;    
        `,  
        `
        CREATE TABLE IF NOT EXISTS adminUser (
            adminUserID INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
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