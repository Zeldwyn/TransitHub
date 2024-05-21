//app.js mga SQL statements and routes for API call sa backend
const express = require('express');
const cors = require('cors');
const {sendOTP} = require('./mail');
const {generateOTP, isDeviceIDExists, getGuestID, isConversationExists, setUser, getPremiumID, isInviteExists, getOwnerOperatorID} = require('./functions');
const {pool} = require('./database');

const app = express();

app.use(express.json());
app.use(cors());

//let storedOTP = "123456";
 let storedEmail;
 let storedOTP;
//let storedEmail = "nimehellokitty@gmail.com";

// AUTHENTICATIONS
app.post('/send-OTP', async (req, res) => { 
    const { email } = req.body;
    const sql = `SELECT email FROM premiumUser WHERE email = ?`;
    pool.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Server Side Error', err);
            res.status(500).json({ success: false, error: 'Internal server error' });
        } else {
            if (result.length > 0) {
                console.log('Email already taken');
                res.status(200).json({ isValid: false});
            } else {
                console.log('Email is available');
                storedEmail = email;
                try {
                    storedOTP = generateOTP();
                    sendOTP({ email, otp: storedOTP}); 
                    res.status(200).json({ message: 'OTP sent successfully', isValid: true }); 
                } catch (error) {
                    console.error(error); 
                    res.status(500).json({ error: 'Failed to send OTP' });
                }
            }
        }
    });
});

app.post('/verify-OTP', async (req, res) => {
    const {otp} = req.body;
    // let otp = "123456";
    try {
        if(otp === storedOTP) {
            res.status(200).json({ isValid: true });
        } else {
            res.status(400).json({ isValid: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
})

app.post('/resend-OTP', async (req, res) => { 
    try {
        await sendOTP({ email: storedEmail, otp: storedOTP}); 
        res.status(200).json({ message: 'OTP sent successfully' }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send OTP' }); 
    }
});

app.post('/add-PremiumUser', async (req, res) => {
    const {firstName, lastName, password, userType} = req.body;
    
    const sql = `INSERT INTO premiumUser (email, firstName, lastName, password, userType) VALUES (?, ?, ?, ?, ?)`;
    pool.query(sql, [storedEmail, firstName, lastName, password, userType], (err, result) => {
        if (err) {
            console.error('Error adding premium user:', err);
            res.status(500).json({ error: 'Fail' }); 
        } else {
            getPremiumID(storedEmail, (exists, premiumUserID) => { 
                if(exists) {
                    setUser(userType, premiumUserID, (success) => {
                        if(success)
                            console.log('Successful setUser');
                        else
                            console.log('Unsuccessful setUser');
                    })
                }
            })
            console.log('Premium user added successfully');
            res.status(200).json({ message: 'Success' }); 
        }
    });
});

app.post('/validate-Login', async (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT email, password, userType FROM premiumUser WHERE email = ? AND password = ?`;
    pool.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('Server Side Error', err);
            res.status(500).json({ success: false, error: 'Internal server error' });
        } else {
            if (result.length > 0) {
                console.log('Login successful');
                res.status(200).json({ isValid: true, userType: result[0].userType});
            } else {
                console.log('Invalid login credentials');
                res.status(400).json({ isValid: false });
            }
        }
    });
});

app.post('/user-Details', async (req, res) => {
    const { email } = req.body;
    const sql = `SELECT firstName, lastName, password FROM premiumUser WHERE email = ?`;
    pool.query(sql, [email] , (err, result) => {
        if(err) {
            console.error('Server Side Error', err);
            res.status(500).json({ success: false, error: 'Internal server error' })
        } else {
            if(result.length > 0) {
                console.log(result[0].firstName, result[0].lastName, result[0].password);
                res.status(200).json({firstName: result[0].firstName, lastName: result[0].lastName, password: result[0].password});
            } else {
                console.log('User not found!');
                res.status(400).json({success: false});
            }
        }
    });
});

app.put('/update-UserDetails', async (req, res) => {
    const { email, firstName, lastName, password  } = req.body;
    const sql = `UPDATE premiumUser SET firstName = ?, lastName = ?, password = ? WHERE email = ?`;
    pool.query(sql, [firstName, lastName, password, email], (err, result) => {
        if(err) {
            console.error('Server Side Error', err);
            res.status(500).json({ success: false, error: 'Internal server error' });
        } else {
            if(result.affectedRows > 0) {
                console.log('User details updated successfully');
                res.status(200).json({ success: true, message: 'User details updated successfully' });
            } else {
                console.log('User not found or no changes made');
                res.status(400).json({ success: false, error: 'User not found or no changes made' });
            }
        }
    });
});

app.post('/add-GuestUser', async (req, res) => {
    const { deviceID } = req.body;
    isDeviceIDExists(deviceID, (exists) =>{
        if(exists)
            res.status(200).json({ message: 'DeviceID already exists' });
        else {
            const insertQuery = `INSERT INTO guestUser (deviceID) VALUES (?)`;
            pool.query(insertQuery, [deviceID], (insertErr, insertResult) => {
                if (insertErr) {
                    console.error('Error adding Guest user:', insertErr);
                    res.status(400).json({ error: 'Fail' }); 
                } else {
                    console.log('Guest user added successfully');
                    res.status(200).json({ message: 'Success' }); 
                }
            });   
        }   
    })  
});
//END

//TRANSACTIONS
app.post('/add-Transaction', async (req, res) => {
    const { deviceID, toLocation, fromLocation } = req.body;
    const status = "Ongoing";
    isDeviceIDExists(deviceID, (exists) =>{
        if(!exists)
            res.status(400).json({ message: 'DeviceID does not exists' });
        else {
            getGuestID(deviceID, (success, guestID) => {
                if (success) {
                    const sql = `INSERT INTO transaction (toLocation, fromLocation, status, guestID) VALUES (?, ?, ?, ?)`;
                        pool.query(sql, [toLocation, fromLocation, status, guestID], (err, result) => {
                            if (err) {
                                console.error('Error adding transaction:', err);
                                res.status(400).json({ error: 'Fail' }); 
                            } else {
                                console.log('Transaction user added successfully');
                                res.status(200).json({ message: 'Success' }); 
                            }
                    });
                } else {
                    console.log('Device ID does not exist or error occurred.');
                    res.status(400).json({ message: 'GuestID does not exists' });
                }
            });
        }   
    })  
});

app.post('/display-Transaction', async (req, res) => {
    const { deviceID } = req.body;
    isDeviceIDExists(deviceID, (exists) =>{
        if(!exists)
            res.status(400).json({ message: 'DeviceID does not exists' });
        else {
            getGuestID(deviceID, (success, guestID) => {
                if (success) {
                    const sql = `SELECT toLocation, fromLocation, status, created_at FROM transaction where guestID = ?`;
                        pool.query(sql, [guestID], (err, result) => {
                            if (err) {
                                console.error('Error Hehe:', err);
                                res.status(400).json({ error: 'Fail' }); 
                            } else {
                                console.log('Transaction user added successfully');   
                                res.status(200).json({ result }); 
                            }
                    });
                } else {
                    console.log('Device ID does not exist or error occurred.');
                    res.status(400).json({ message: 'GuestID does not exists' });
                }
            });
        }   
    })  
});
//END

//MESSAGE
app.post('/create-Conversation', async (req, res) => {
    const { ownerID, operatorID } = req.body;
    isConversationExists(ownerID, operatorID, (exists, conversationID) => {
        if(!exists) {
            const sql = `INSERT INTO conversation (ownerID, operatorID) VALUES (?, ?)`;
                pool.query(sql, [ownerID, operatorID], (err, result) => {
                if (err) {
                    console.error('Error adding conversation:', err);
                    res.status(400).json({ status: 'Fail' }); 
                } else {
                    console.log('Conversation user added successfully');
                    res.status(200).json({ status: 'Success' }); 
                }
            });
        } else {
            res.status(200).json({conversatioID: conversationID});
        }
    });
});
//END

//ADD OPERATOR
app.get('/search-Operator', async (req, res) => {
    const { search } = req.query;
    const status = [];
    try {
        const sql = `SELECT email, firstName, lastName, premiumUserID FROM premiumUser WHERE userType = 'Transport Operator' AND email LIKE ?`;
        const query = `%${search}%`; 
        pool.query(sql, query, (err, usersResult) => {
            if (err) {
                console.error('Error executing SQL query for users:', err);
                return res.status(500).send('Internal Server Error');
            } else {
                const userIds = usersResult.map(user => user.premiumUserID);
                if (userIds.length === 0) {
                    return res.status(200).json({ users: [], status: status });
                }
                let invitesProcessed = 0;
                userIds.forEach(userId => {
                    const view = `SELECT status FROM InviteView WHERE premiumUserID = ?`;
                    pool.query(view, [userId], (err, invitesResult) => { 
                        if(err) {
                            console.error('Error executing SQL query for invites:', err);
                        } else {
                            invitesProcessed++;
                            if (invitesResult.length > 0) {
                                status.push(invitesResult[0].status);
                            }
                            if (invitesProcessed === userIds.length) {
                                res.status(200).json({ users: usersResult, status: status });
                            }
                        }
                    });
                });
            }
        });
    } catch (error) {
        console.error('Error in search-Operator route:', error);
        return res.status(500).send('Internal Server Error');
    }
});
app.post('/send-Invite', async (req, res) => { 
    const { ownerID, premiumUserID } = req.body;
    getOwnerOperatorID(premiumUserID, 'Transport Operator', (exists, temp) => {
        if(exists) {
            isInviteExists(ownerID, temp, (exists, ID) =>{ 
                if(!exists) {
                    const sql = `INSERT INTO invites (ownerID, operatorID, status) VALUES (?, ?, ?)`;
                        console.log('OpIDINSIDE', temp);
                        pool.query(sql, [ownerID, temp, "Pending"], (err, result) => {
                        if (err) {
                            console.error('Error sending invite', err);
                            res.status(400).json({ status: 1 }); 
                        } else {
                            console.log('Invite sent successfully');
                            res.status(200).json({ status: 2 }); 
                        }
                    });
                } else {
                    res.status(200).json({ status: 3})
                }
            });
        }
            
    }); 
});

app.post('/display-Invites', async (req, res) => { 
    const { ownerID } = req.body;
    const sql = `SELECT * FROM InviteView WHERE ownerID = ?`;
    pool.query(sql, [ownerID], (err, result) => {
        if (err) {
            console.error('Error:', err);
            res.status(400).json({ error: 'Failed to retrieve invites' }); 
        } else {
            console.log('Invites retrieved successfully');   
            res.status(200).json({ result }); 
        }
    });     
});

app.post('/tester', async (req, res) => {
    const {id, usertype} = req.body;

    getOwnerOperatorID(id, usertype, (exists, operatorID) =>{
        res.status(200).json(operatorID)
    })
});
//END


module.exports = app;

// if existing ang conversation with ownerID and operatorID di mo buhat new conversation e return ang conversation ID
// create-Conversation