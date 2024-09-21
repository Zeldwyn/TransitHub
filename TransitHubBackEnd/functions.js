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

function isConversationExists(ownerID, operatorID, callback) {
    const sql = `SELECT * FROM conversation WHERE ownerID = ? AND operatorID = ?`;
    pool.query(sql, [ownerID, operatorID], (err, res) => {
        if (err) {
            console.log('Server Side Error:', err);
            callback(false);
        } else {
            if(res.length > 0) {
                console.log('Conversation Exists:', res[0].conversationID);
                callback(true, res[0].conversationID);
            } else {
                callback(false);
            }
        }
    });
};

function isInviteExists(ownerID, operatorID, callback) {
    const sql = `SELECT * FROM invites WHERE ownerID = ? AND operatorID = ?`;
    pool.query(sql, [ownerID, operatorID], (err, res) => {
        if (err) {
            console.log('Server Side Error:', err);
            callback(false);
        } else {
            if(res.length > 0) {
                console.log('Invite Exists:', res[0].conversationID);
                callback(true, res[0].conversationID);
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

function setUser(userType, premiumUserID, callback) {
    let sql;

    // Use if/else or switch to handle different user types
    if (userType === 'operator') {
        sql = `INSERT INTO operator (premiumUserID) VALUES (?)`;
    } else if (userType === 'owner') {
        sql = `INSERT INTO owner (premiumUserID) VALUES (?)`;
    } else {
        // If userType doesn't match expected values, return false
        return callback(false);
    }

    pool.query(sql, [premiumUserID], (err, res) => {
        if (err) {
            console.log('Server Side Error:', err);
            callback(false);
        } else {
            callback(true);
        }
    });
}

function getPremiumID(email, callback) {
    const sql = `SELECT premiumUserID FROM premiumuser WHERE email = ?`;
    pool.query(sql, [email], (err, res) => {
        if (err) {
            console.log('Server Side Error:', err);
            callback(false);
        } else {
            if(res.length > 0) { 
                callback(true, res[0].premiumUserID);
            } else {
                callback(false);
            }
        }
    });
};

function getOwnerOperatorID(premiumUserID, userType, callback) {
    let idName;
    if(userType == "operator") 
        idName = "operatorID";
    else if (userType == "owner") 
        idName = "ownerID";
    
    const sql = `SELECT ${idName} FROM ${userType} WHERE premiumUserID = ?`;
    pool.query(sql, [premiumUserID], (err, res) => {
        if (err) {
            console.log('Server Side Error:', err);
            callback(false);
        } else {
            if(res.length > 0) { 
                if(userType == "owner")
                    callback(true, res[0].ownerID);
                if(userType == "operator")
                    callback(true, res[0].operatorID);
            } else {
                callback(false);
            }
        }
    });
};


module.exports = { generateOTP, 
                   isDeviceIDExists, 
                   isInviteExists,
                   isConversationExists,
                   getGuestID, 
                   setUser,
                   getPremiumID,
                   getOwnerOperatorID
                };