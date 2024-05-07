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
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS premiumUser (
            premiumUserID INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) NOT NULL,
            firstName VARCHAR(50) NOT NULL,
            lastName VARCHAR(50) NOT NULL,
            password VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    connection.query(createTableQuery, (err, results) => {
        connection.release(); // Release the connection back to the pool
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Table created successfully');
        }
    });
});

module.exports = pool.promise();

// CREATE TABLE IF NOT EXISTS premiumUser (
//     premiumUserID INT AUTO_INCREMENT PRIMARY KEY,
//     email VARCHAR(100) NOT NULL,
//     firstName VARCHAR(50) NOT NULL,
//     lastName VARCHAR(50) NOT NULL,
//     password VARCHAR(100) NOT NULL,
//     deviceUUID VARCHAR(36),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// )
