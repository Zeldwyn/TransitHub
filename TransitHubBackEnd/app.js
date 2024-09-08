//app.js mga SQL statements and routes for API call sa backend
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const {sendOTP} = require('./mail');
const {generateOTP, isDeviceIDExists, getGuestID, isConversationExists, setUser, getPremiumID, isInviteExists, getOwnerOperatorID} = require('./functions');
const {pool} = require('./database');

const app = express();

app.use(express.json());
app.use(cors({
    origin: '*'
}));
app.use(session ({
    secret: 'hatdog',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.post('/send-OTP', async (req, res) => { 
    const { email } = req.body;
    const sql = `SELECT email FROM premiumUser WHERE email = ?`;
    pool.query(sql, [email], (err, result) => {
        if (err) {
            res.status(500).json({ success: false, error: 'Internal server error Send - OTP' });
        } else {
            if (result.length > 0) {
                console.log('Email already taken');
                res.status(200).json({ isValid: false});
            } else {
                console.log('Email is available');
                try {
                    const generatedOTP = generateOTP(); 
                    req.session.otp = generatedOTP;
                    req.session.email = email;

                    sendOTP({ email, otp: generatedOTP }); 
                    console.log('OTP sent successfully!');
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
    try {
        const storedOTP = req.session.otp;
        if(otp === storedOTP) {
            req.session.otp = null;
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
        await sendOTP({ email: req.session.email, otp: req.session.otp}); 
        res.status(200).json({ message: 'OTP sent successfully' }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send OTP' }); 
    }
});

app.post('/add-PremiumUser', async (req, res) => {
    const {firstName, lastName, password, userType} = req.body;
    console.log(req.session.email)
    const sql = `INSERT INTO premiumUser (email, firstName, lastName, password, userType) VALUES (?, ?, ?, ?, ?)`;
    pool.query(sql, [req.session.email, firstName, lastName, password, userType], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Fail adding Premium User' }); 
        } else {
            getPremiumID(req.session.email, (exists, premiumUserID) => { 
                if(exists) {
                    setUser(userType, premiumUserID, (success) => {
                        if(success)
                            console.log('Successful setUser');
                        else
                            console.log('Unsuccessful setUser');
                    })
                }
            })
            res.status(200).json({ message: 'Success adding Premium User' }); 
        }
    });
});

app.post('/validate-AdminLogin', (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT username, password, email, firstname, lastname, phonenumber, adminUserID FROM adminUser WHERE username = ?`;

    pool.query(sql, [username], (err, result) => {
        if (err) {
            console.error('Server Side Error', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }

        if (result.length > 0) {
            // Check if the provided password matches the stored password directly
            const storedPassword = result[0].password;

            if (password === storedPassword) {
                console.log('Login successful');
                return res.status(200).json({
                    isValid: true,
                    adminUserID: result[0].adminUserID,
                    username: result[0].username,
                    email: result[0].email,
                    firstname: result[0].firstname,
                    lastname: result[0].lastname,
                    phonenumber: result[0].phonenumber
                });
            } else {
                console.log('Invalid login credentials');
                return res.status(400).json({ isValid: false });
            }
        } else {
            console.log('Invalid login credentials');
            return res.status(400).json({ isValid: false });
        }
    });
});





app.post('/validate-Login', async (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT email, password, userType, premiumUserID FROM premiumUser WHERE email = ? AND password = ?`;
    pool.query(sql, [email, password], (err, result) => {
        if (err) {
            res.status(500).json({ success: false, error: 'Internal server error Validate Login' });
        } else {
            if (result.length > 0) {
                console.log('Login successful');
                res.status(200).json({ isValid: true, userType: result[0].userType, id: result[0].premiumUserID});
            } else {
                console.log('Invalid login credentials');
                res.status(400).json({ isValid: false });
            }
        }
    });
});

app.post('/user-Details', async (req, res) => {
    const { premiumUserID } = req.body;
    const sql = `SELECT firstName, lastName, password FROM premiumUser WHERE premiumUserID = ?`;
    pool.query(sql, [premiumUserID] , (err, result) => {
        if(err) {
            res.status(500).json({ success: false, error: 'Internal server error User-Details' })
        } else {
            if(result.length > 0) {
                console.log(result[0].firstName, result[0].lastName, result[0].password);
                res.status(200).json({firstName: result[0].firstName, lastName: result[0].lastName, password: result[0].password});
            } else {
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
            res.status(500).json({ success: false, error: 'Internal server error Update User Details' });
        } else {
            if(result.affectedRows > 0) {
                res.status(200).json({ success: true, message: 'User details updated successfully' });
            } else {
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
                    res.status(400).json({ error: 'Failed Adding Guest User' }); 
                } else {;
                    res.status(200).json({ message: 'Success Adding Guest User' }); 
                }
            });   
        }   
    })  
});
//END

//TRANSACTIONS
app.post('/add-PremiumTransaction', async (req, res) => {
    const { premiumUserID, toLocation, fromLocation } = req.body;   
    const sql = `INSERT INTO transactionPremium (premiumUserID, toLocation, fromLocation, status) VALUES (?, ?, ?, ?)`;
    pool.query(sql, [premiumUserID, toLocation, fromLocation, 'Ongoing'], (err, result) => {
        if (err) { 
            res.status(400).json({ status: 0, err}); 
        } else {
            const transactionID = result.insertId;
            res.status(200).json({ status: 1, transactionID: transactionID });
        }
    });  
});

app.put('/transaction-Status', (req, res) => {
    const { transactionID } = req.body;
    pool.query('UPDATE transactionPremium SET status = ? WHERE transactionID = ?', ['Arrived', transactionID], (err, results) => {
        if (err) {
            console.error('Error updating  transaction:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
        
            res.status(200).json({ message: 'Transaction updated successfully' });
        }
    });
});

app.post('/add-GuestTransaction', async (req, res) => {
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
                                res.status(400).json({ error: 'Fail Adding Transaction' }); 
                            } else {
                                res.status(200).json({ message: 'Success Adding Transaction' }); 
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

app.post('/display-TransactionGuest', async (req, res) => {
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
                                res.status(400).json({ error: 'Fail Displaying Transaction' }); 
                            } else {
                                console.log('Transaction Displayed successfully');   
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

app.post('/display-TransactionPremium', async (req, res) => {
    const { premiumUserID } = req.body;
    const sql = `SELECT toLocation, fromLocation, status, created_at FROM transactionPremium where premiumUserID = ?`;
    pool.query(sql, [premiumUserID], (err, result) => {
        if (err) {
            res.status(400).json({ error: 'Fail Displaying Transaction' }); 
        } else {
            console.log('Transaction Displayed successfully');   
            res.status(200).json({ result }); 
        }
    }); 
});
//END

//MESSAGE
app.post('/get-ConversationID', async (req, res) => {
    const { ownerID, operatorID } = req.body;
    isConversationExists(ownerID, operatorID, (exists, conversationID) => {
        if(exists) {
            res.status(200).json({conversationID: conversationID});
        } else {
            res.status(400).json({status: "Conversation Does not Exists"});
        }
    });
});
app.post('/get-ConversationIDOP', async (req, res) => {
    const { premiumUserID } = req.body;
    getOwnerOperatorID(premiumUserID, 'operator', (exists, id) => { 
        if(exists) {
            const sql = `SELECT conversationID, ownerID FROM conversation WHERE operatorID = ?`;
            pool.query(sql, [id], (err, result) => {
                if(err) {
                    res.status(400).json({ error: 'Failed to retrieve ID' }); 
                } else {
                    res.status(200).json({ conversationID: result[0].conversationID, ownerID: result[0].ownerID, operatorID: id}); 
                }
            });
        }
    }); 
});
app.post('/message-Owner', async (req, res) => {
    const { premiumUserID } = req.body;
    const sql = `SELECT * FROM OperatorInviteDetails WHERE ownerPremiumUserID = ? and status =?`;
    pool.query(sql, [premiumUserID, 'Accepted'], (err, result) => {
        if (err) {
            console.error('Error:', err);
            res.status(400).json({ error: 'Failed to retrieve invites' }); 
        } else {
            console.log('Invites retrieved successfully');   
            res.status(200).json({ result }); 
        }
    });   
});

app.post('/get-Messages', (req, res) => {
    const { premiumUserID, userType } = req.body;
    getOwnerOperatorID(premiumUserID, userType, (exists, id) => { 
        if(exists) {
            const getMessagesSql = `SELECT * FROM message WHERE ${userType}ID = ?`;
            pool.query(getMessagesSql, [id], (err, results) => {
            if (err) {
                console.error('Error fetching messages:', err);
                    res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ results });
            });
        }
    });
});

app.post('/select-Messages', (req, res) => {
    const { conversationID } = req.body;
    const getMessagesSql = `SELECT * FROM message WHERE conversationID = ?`;
    pool.query(getMessagesSql, [conversationID], (err, results) => {
    if (err) {
        console.error('Error fetching messages:', err);
            res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ results });
    });
});

app.post('/save-Message', (req, res) => {
    const { conversationID, userType, text } = req.body;
    const insertMessageSql = `INSERT INTO message (conversationID,userType, text) VALUES (?, ?, ?)`;
    pool.query(insertMessageSql, [conversationID, userType, text], (err, results) => {
      if (err) {
        console.error('Error inserting message:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json({ success: true });
      }
    });
  });
//END

//ADD OPERATOR
app.get('/search-Operator', async (req, res) => {
    const { search } = req.query;
    try {
        const sql = `SELECT * FROM OperatorDetails WHERE email LIKE ?`;
        const query = `%${search}%`;
        pool.query(sql, [query], (err, results) => {
            if (err) {
                return res.status(500).send('Internal Server Error Search Operator');
            }
            return res.json(results);
        });
    } catch (error) {
        return res.status(500).send('Internal Server Error Search Operator Outer');
    }
});
app.post('/send-Invite', async (req, res) => { 
    const { premiumUserID, operatorID } = req.body;
    getOwnerOperatorID(premiumUserID, 'owner', (exists, ownerID) => { 
        if(exists) {
            isInviteExists(ownerID, operatorID, (exists, ID) =>{ 
                if(!exists) {
                    const sql = `INSERT INTO invites (ownerID, operatorID, status) VALUES (?, ?, ?)`;
                    console.log('OpIDINSIDE', operatorID);
                    pool.query(sql, [ownerID, operatorID, "Pending"], (err, result) => {
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
    })            
});

app.post('/sent-Invites', async (req, res) => { 
    const { premiumUserID } = req.body;
    const sql = `SELECT * FROM operatorInviteDetails WHERE ownerPremiumUserID = ?`;
    pool.query(sql, [premiumUserID], (err, result) => {
        if (err) {
            res.status(400).json({ error: 'Failed to retrieve invites Owner' }); 
        } else {
            console.log('Invites retrieved successfully');   
            res.status(200).json({ result }); 
        }
    });     
});

app.post('/received-Invites', async (req, res) => { 
    const { premiumUserID } = req.body;
    getOwnerOperatorID(premiumUserID, 'operator', (exists, operatorID) => { 
        if(exists) {
            const sql = `SELECT * FROM operatorInviteDetails WHERE operatorID = ?`;
            pool.query(sql, [operatorID], (err, result) => {
                if (err) {
                    res.status(400).json({ error: 'Failed to retrieve invites Operator' }); 
                } else {
                    res.status(200).json({ result }); 
                }
            });
        }
    })
});

app.put('/accept-Invites', async (req, res) => { 
    const { ownerID, premiumUserID } = req.body;
    const sql = `UPDATE operator SET ownerID = ? WHERE premiumUserID = ? `;
    pool.query(sql, [ownerID, premiumUserID], (err, result) => {
        if (err) {
            res.status(400).json({ status: 'Fail Accepting Invite' }); 
        } else {
            getOwnerOperatorID(premiumUserID, 'operator', (exists, operatorID) => { 
                if(exists) {
                    const sql2 = `UPDATE invites SET status = ? WHERE operatorID = ?`;
                    pool.query(sql2, ['Accepted', operatorID], (err, result) => {
                        if (err) {
                            res.status(400).json({ status: 'Fail Updating Invites to Accepted' }); 
                        }
                    })
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
                }
            })
        }
    })
});

//FEEDBACK
app.post('/add-Feedback', async (req, res) => {
    const { feedbackMessage, rate } = req.body;
    const sql = `INSERT INTO feedback (feedbackMessage, rate) VALUES (?, ?)`;
    pool.query(sql, [feedbackMessage, rate], (err, result) => {
        if (err) {
            res.status(400).json({ error: 'Failed to add Feedback.' }); 
        } else {
            console.log('Feedback added successfully');   
            res.status(200).json({ status: 'Success Add Feedback' }); 
        }
    });   
});

app.post('/tester', async (req, res) => {
    const { premiumUserID } = req.body;
    const sql = `SELECT * FROM OperatorInviteDetails WHERE ownerPremiumUserID = ? and status =?`;
    pool.query(sql, [premiumUserID, 'Accepted'], (err, result) => {
        if (err) {
            console.error('Error:', err);
            res.status(400).json({ error: 'Failed to retrieve invites' }); 
        } else {
            console.log('Invites retrieved successfully');   
            res.status(200).json({ result }); 
        }
    });   
});

app.get('/premiumUsers', (req, res) => {
    pool.query('SELECT * FROM premiumUser', (err, results) => {
        if (err) {
            console.error('Error fetching premium users:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(200).json(results);
        }
    });
});

app.post('/premiumUsers', (req, res) => {
    const { firstName, lastName, email, password, userType } = req.body;
    pool.query('INSERT INTO premiumUser (firstName, lastName, email, password, userType) VALUES (?, ?, ?, ?, ?)', [firstName, lastName, email,password, userType], (err, results) => {
        if (err) {
            console.error('Error adding premium user:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(201).json({ message: 'Premium user added successfully' });
        }
    });
});

app.put('/premiumUsers/:id', (req, res) => {
    const premiumUserID = req.params.id;
    const { firstName, lastName, email, userType } = req.body;
    pool.query('UPDATE premiumUser SET firstName=?, lastName=?, email=?, userType=? WHERE premiumUserID=?', 
        [firstName, lastName, email, userType, premiumUserID], 
        (err, results) => {
            if (err) {
                console.error('Error updating premium user:', err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.status(200).json({ message: 'Premium user updated successfully' });
            }
        }
    );
});

app.get('/premiumUsers/:id', (req, res) => {
    const premiumUserID = req.params.id;
    pool.query('SELECT * FROM premiumUser WHERE premiumUserID = ?', [premiumUserID], (err, results) => {
        if (err) {
            console.error('Error fetching premium user:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        }
    });
});


app.delete('/premiumUsers/:id', (req, res) => {
    const userId = req.params.id;
    pool.query('DELETE FROM premiumUser WHERE premiumUserID = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error deleting premium user:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(200).json({ message: 'Premium user deleted successfully' });
        }
    });
});

app.put('/update-AdminDetails', (req, res) => {
    const { adminUserID, username, email, password, firstname, lastname, phonenumber, role } = req.body;

    if (!adminUserID) {
        return res.status(400).json({ success: false, error: 'Admin User ID is required' });
    }

    const sql = `UPDATE adminUser SET username = ?, email = ?, password = ?, firstname = ?, lastname = ?, phonenumber = ?, role = ? WHERE adminUserID = ?`;
    pool.query(sql, [username, email, password, firstname, lastname, phonenumber, role, adminUserID], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Admin details updated successfully' });
        } else {
            res.status(400).json({ success: false, error: 'Admin not found or no changes made' });
        }
    });
});

app.get('/admin-details', (req, res) => {
    const adminUserID = req.query.adminUserID; 

    if (!adminUserID) {
        return res.status(400).json({ success: false, error: 'Admin User ID is required' });
    }

    const sql = `SELECT * FROM adminUser WHERE adminUserID = ?`;
    pool.query(sql, [adminUserID], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        
        if (result.length > 0) {
            res.status(200).json({ success: true, data: result[0] });
        } else {
            res.status(404).json({ success: false, error: 'Admin not found' });
        }
    });
});

//END


module.exports = app;

// if existing ang conversation with ownerID and operatorID di mo buhat new conversation e return ang conversation ID
// create-Conversation