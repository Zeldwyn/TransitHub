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
                console.log('Conversation Exists:', res[0].conversationID);
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
    let type;
    if(userType == "Transport Operator") 
        type = "operator";
    else if (userType == "Business Owner")
        type = "owner";

    const sql = `INSERT INTO ${type} (premiumUserID) VALUES (?)`;
    pool.query(sql, [premiumUserID], (err, res) => {
        if (err) {
            console.log('Server Side Error:', err);
            callback(false);
        } else {
            callback(true);
        }
    });
};

function getPremiumID(email, callback) {
    const sql = `SELECT premiumUserID FROM premiumUser WHERE email = ?`;
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
    let type;
    let idName;
    if(userType == "Transport Operator") {
        type = "operator";
        idName = "operatorID";
    }   
    else if (userType == "Business Owner") {
        type = "owner";
        idName = "ownerID";
    }
    const sql = `SELECT ${idName} FROM ${type} WHERE premiumUserID = ?`;
    pool.query(sql, [premiumUserID], (err, res) => {
        if (err) {
            console.log('Server Side Error:', err);
            callback(false);
        } else {
            if(res.length > 0) { 
                if(type == "owner")
                    callback(true, res[0].ownerID);
                if(type == "operator")
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