//functions.js
const {pool} = require('./database');

function generateOTP() {
    const temp = Math.floor(Math.random() * 1000000);
    return temp.toString().padStart(6, '0'); 
};

function isDeviceIDExists(deviceID, callback) {
    const sql = `SELECT * FROM guestUser WHERE deviceID = ?`;
    pool.query(sql, [deviceID], (err, res) => {
        if (err) {
            console.log('Server Side Error:', err);
            callback(false);
        } else {
            if(res.length > 0) {
                console.log('deviceID already exists:', deviceID);
                callback(true);
            } else {
                callback(false);
            }
        }
    });
};

function getGuestID(deviceID, callback) {
    const sql = `SELECT guestID FROM guestUser WHERE deviceID = ?`;
    pool.query(sql, [deviceID], (err, res) => {
        if (err) {
            console.log('Server Side Error:', err);
            callback(false);
        } else {
            if(res.length > 0) {
                console.log('deviceID already exists:', deviceID);
                callback(true, res[0].guestID);
            } else {
                callback(false);
            }
        }
    });
};

module.exports = { generateOTP, isDeviceIDExists, getGuestID};