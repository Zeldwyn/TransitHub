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

                const userType = result[0].userType;
                const premiumUserID = result[0].premiumUserID;

                // If user is an owner, fetch the ownerID
                if (userType === 'owner') {
                    const ownerSql = `SELECT ownerID FROM owner WHERE premiumUserID = ?`; // Assuming owner is related to premiumUserID
                    pool.query(ownerSql, [premiumUserID], (err, ownerResult) => {
                        if (err) {
                            res.status(500).json({ success: false, error: 'Internal server error fetching ownerID' });
                        } else if (ownerResult.length > 0) {
                            res.status(200).json({
                                isValid: true,
                                userType: userType,
                                id: premiumUserID,
                                ownerID: ownerResult[0].ownerID, // Send ownerID for owner
                            });
                        } else {
                            res.status(400).json({ success: false, error: 'No ownerID found for this user' });
                        }
                    });
                } else {
                    // For non-owner users, just send the premiumUserID
                    res.status(200).json({
                        isValid: true,
                        userType: userType,
                        id: premiumUserID, // Send the premiumUserID as id
                    });
                }
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
app.post('/add-Transaction', async (req, res) => {
    const {
        toCoords, fromCoords, clientName, itemDescription, packageWeight, itemQuantity, vehicleFee,
        notes, first2km, succeedingKm, expectedDistance, startDate, endDate, expectedDuration, expectedFee
    } = req.body;

    const sql = `
        INSERT INTO transaction (
            toLatitude, toLongitude, fromLatitude, fromLongitude, clientName, itemDescription, packageWeight, itemQuantity, vehicleFee,
            notes, first2km, succeedingKm, expectedDistance, startDate, endDate, expectedDuration, expectedFee
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    pool.query(sql, [
        toCoords.latitude, toCoords.longitude, fromCoords.latitude, fromCoords.longitude, 
        clientName, itemDescription, packageWeight, itemQuantity, vehicleFee,
        notes, first2km, succeedingKm, expectedDistance, startDate, endDate, expectedDuration, expectedFee
    ], (err, result) => {
        if (err) { 
            res.status(400).json({ status: 0, err }); 
        } else {
            const transactionID = result.insertId;
            res.status(200).json({ status: 1, transactionID: transactionID });
        }
    });
});


app.post('/add-booking', (req, res) => {
    const {finalFee,transactionID, operatorID, premiumUserID } = req.body;
    getOwnerOperatorID(premiumUserID, 'owner', (exists, id) => { 
        if(exists) {
            const query = ` INSERT INTO booking (finalFee, status, transactionID, operatorID, ownerID) VALUES (?, ?, ?, ?, ?)`;
            pool.query(query, [finalFee, 'Pending', transactionID, operatorID, id], (err, result) => {
                if (err) {
                    console.error('Error inserting booking:', err);
                    return res.status(400).json({err});
                }
                res.status(200).json({ message: 'Booking added successfully'});
            });
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
    const { premiumUserID, operatorID } = req.body;
    getOwnerOperatorID(premiumUserID, 'owner', (exists, id) => { 
        if(exists) {
            isConversationExists(id, operatorID, (exists, conversationID) => {
                if(exists) {
                    res.status(200).json({conversationID: conversationID});
                } else {
                    res.status(400).json({status: "Conversation Does not Exists"});
                }
            });
        }
    }); 
});
app.post('/get-ConversationIDOP', async (req, res) => {
    const { premiumUserID, ownerID } = req.body;
    getOwnerOperatorID(premiumUserID, 'operator', (exists, id) => { 
        if(exists) {
            isConversationExists(ownerID, id, (exists, conversationID) => {
                if(exists) {
                    res.status(200).json({conversationID: conversationID, ownerID: ownerID, operatorID: id});
                } else {
                    res.status(400).json({status: "Conversation Does not Exists"});
                }
            });
        }
    }); 
});
app.post('/get-ConversationDetails', async (req, res) => {
    const { premiumUserID, operatorID } = req.body;
    getOwnerOperatorID(premiumUserID, 'owner', (exists, id) => { 
        if(exists) {
            isConversationExists(id, operatorID, (exists, conversationID) => {
                if(exists) {
                    const sql = `SELECT *  FROM conversation WHERE operatorID = ? and ownerID = ?`;
                    pool.query(sql, [operatorID, id], (err, result) => {
                        if(err) {
                            res.status(400).json({ error: 'Failed to retrieve ID' }); 
                        } else {
                            res.status(200).json({ ownerID: result[0].ownerID, operatorID: id}); 
                        }
                    });
                } else {
                    res.status(400).json({status: "Conversation Does not Exists"});
                }
            });
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
    const { search, premiumUserID } = req.query;  
    getOwnerOperatorID(premiumUserID, 'owner', (exists, ownerID) => { 
        if (exists) {
            try {
                const sql = `
                    SELECT * 
                    FROM OperatorDetails od
                    WHERE od.email LIKE ?
                    AND NOT EXISTS (
                        SELECT 1 
                        FROM operator_owner oo
                        WHERE oo.operatorID = od.operatorID 
                        AND oo.ownerID = ?
                    )
                `;
                const query = `%${search}%`;
                
                pool.query(sql, [query, ownerID], (err, results) => {
                    if (err) {
                        return res.status(500).send('Internal Server Error: Search Operator');
                    }
                    return res.json(results);
                });
            } catch (error) {
                return res.status(500).send('Internal Server Error: Search Operator Outer');
            }
        } 
    }); 
});


app.post('/add-Operator', async (req, res) => {
    const { premiumUserID, operatorID } = req.body;
    getOwnerOperatorID(premiumUserID, 'owner', (exists, ownerID) => { 
        if (exists) {
            const insertOperatorSQL = `INSERT INTO operator_owner (operatorID, ownerID) VALUES (?, ?)`;
            pool.query(insertOperatorSQL, [operatorID, ownerID], (err, result) => {
                if (err) {
                    return res.status(400).json({ status: '0' });
                }
                isConversationExists(ownerID, operatorID, (exists, conversationID) => {
                    if (exists) {
                        console.log('Conversation already exists:', conversationID);
                        res.status(200).json({ status: '1', message: 'Operator added but conversation already exists' });
                    } else {
                        const insertConversationSQL = `INSERT INTO conversation (ownerID, operatorID) VALUES (?, ?)`;
                        pool.query(insertConversationSQL, [ownerID, operatorID], (err, result) => {
                            if (err) {
                                return res.status(400).json({ status: '0' });
                            }

                            console.log('Operator added and conversation created successfully');
                            res.status(200).json({ status: '1' });
                        });
                    }
                });
            });   
        } else {
            res.status(400).json({ status: '0' });
        }
    }); 
});

app.get('/list-Operator', async (req, res) => {
    const { premiumUserID } = req.query; 

    getOwnerOperatorID(premiumUserID, 'owner', (exists, id) => {
        if (exists) {
            const sql = `SELECT operatorID FROM operator_owner WHERE ownerID = ?`;
            pool.query(sql, [id], (err, results) => {
                if (err) {
                    return res.status(400).json({ error: 'Failed to retrieve operator IDs' });
                }

                if (results.length === 0) {
                    return res.status(404).json({ message: 'No operators found for this owner.' });
                }

                const operatorIDs = results.map(row => row.operatorID);

                const sql2 = `SELECT * FROM operatorDetails WHERE operatorID IN (?)`;
                pool.query(sql2, [operatorIDs], (err, operatorDetails) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to retrieve operator details' });
                    }

                    res.status(200).json(operatorDetails);
                });
            });
        } else {
            res.status(404).json({ message: 'Owner not found' });
        }
    });
});
app.get('/list-Owner', async (req, res) => {
    const { premiumUserID } = req.query; 
    getOwnerOperatorID(premiumUserID, 'operator', (exists, id) => {
        if (exists) {
            const sql = `SELECT ownerID FROM operator_owner WHERE operatorID = ?`;
            pool.query(sql, [id], (err, results) => {
                if (err) {
                    return res.status(400).json({ error: 'Failed to retrieve owner IDs' });
                }

                if (results.length === 0) {
                    return res.status(404).json({ message: 'No owners found for this owner.' });
                }

                const ownerIDs = results.map(row => row.ownerID);

                const sql2 = `SELECT * FROM ownerDetails WHERE ownerID IN (?)`;
                pool.query(sql2, [ownerIDs], (err, ownerDetails) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to retrieve operator details' });
                    }

                    res.status(200).json(ownerDetails);
                });
            });
        } else {
            res.status(404).json({ message: 'Operator not found' });
        }
    });
});
app.put('/delete-Operator', async (req, res) => {
    const { premiumUserID, operatorID } = req.query;
    
    getOwnerOperatorID(premiumUserID, 'owner', (exists, ownerID) => {
        if (exists) {
            const deleteMessagesSQL = `DELETE FROM message WHERE conversationID IN (SELECT conversationID FROM conversation WHERE ownerID = ? AND operatorID = ?)`;
            pool.query(deleteMessagesSQL, [ownerID, operatorID], (err, result) => {
                if (err) {
                    console.error('Error deleting messages:', err);
                    return res.status(500).send('Internal Server Error: Delete from messages');
                }
                const deleteConversationSQL = `DELETE FROM conversation WHERE ownerID = ? AND operatorID = ?`;  
                pool.query(deleteConversationSQL, [ownerID, operatorID], (err, result) => {
                    if (err) {
                        console.error('Error deleting from conversation:', err);
                        return res.status(500).send('Internal Server Error: Delete from conversation');
                    }
                    const deleteOperatorSQL = `DELETE FROM operator_owner WHERE operatorID = ? AND ownerID = ?`;  
                    pool.query(deleteOperatorSQL, [operatorID, ownerID], (err, result) => {
                        if (err) {
                            console.error('Error deleting from operator_owner:', err);
                            return res.status(500).send('Internal Server Error: Delete from operator_owner');
                        }
                        res.status(200).json('Operator, conversation, and associated messages deleted successfully');
                    });
                });
            });
        } else {
            res.status(404).json({ message: 'Failed to delete' });
        }
    });
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

app.post('/tester', (req, res) => {
    const { premiumUserID } = req.body;
    getOwnerOperatorID(premiumUserID, 'owner', (exists, id) => { 
        if(exists) {
            const sql = `SELECT * FROM bookingDetails WHERE ownerID = ?`;
            pool.query(sql, [id], (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, error: 'Internal server error' });
                }
                if (result.length > 0) {
                    res.status(200).json(result);
                } else {
                    res.status(404).json({ success: false, error: 'Booking not found' });
                }
            });
        }
    }); 
});
app.post('/available-Operators', (req, res) => {
    const { premiumUserID, startDate, endDate } = req.body; 
    let allOperators = [];
    let bookedOperators = [];

    getOwnerOperatorID(premiumUserID, 'owner', (exists, id) => { 
        if (exists) {
            const sql1 = 'SELECT operatorID FROM operator_owner WHERE ownerID = ?';
            pool.query(sql1, [id], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Internal server error1' });
                }
                allOperators = result.map(row => row.operatorID);
                const sql2 = `
                    SELECT operatorID 
                    FROM bookingDetails 
                    WHERE ownerID = ? 
                    AND startDate <= ? 
                    AND endDate >= ?`;
                pool.query(sql2, [id, startDate, endDate], (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: 'Internal server error2' });
                    }
                    bookedOperators = result.map(row => row.operatorID);
                    const availableOperators = allOperators.filter(operatorID => !bookedOperators.includes(operatorID));
                    const sql3 = `SELECT * FROM operatorDetails WHERE operatorID IN (?)`;
                    pool.query(sql3, [availableOperators], (err, operatorDetails) => {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to retrieve operator details' });
                        }

                        res.status(200).json(operatorDetails);
                    });
                });
            });
        } else {
            res.status(404).json({ error: 'Owner not found' });
        }
    }); 
});

app.get('/bookingsOperator', (req, res) => {
    const { month, year, ownerID } = req.query; // Capture ownerID from the query params

    if (!month || !year || !ownerID) {
        return res.status(400).json({ error: 'Month, year, and ownerID parameters are required' });
    }

    const query = `
        SELECT
            b.bookingID,
            b.transactionID,
            b.operatorID,
            b.ownerID,
            t.clientName,
            t.startDate,
            t.endDate,
            o.firstName AS operatorFirstName,
            o.lastName AS operatorLastName
        FROM
            booking b
            JOIN operator_owner oo ON b.operatorID = oo.operatorID AND b.ownerID = oo.ownerID
            JOIN premiumUser o ON oo.operatorID = o.premiumUserID
            JOIN transaction t ON b.transactionID = t.transactionID
        WHERE 
            oo.ownerID = ? AND
            ((MONTH(t.startDate) = ? AND YEAR(t.startDate) = ?) OR 
            (MONTH(t.endDate) = ? AND YEAR(t.endDate) = ?))
    `;

    pool.query(query, [ownerID, parseInt(month, 10), parseInt(year, 10), parseInt(month, 10), parseInt(year, 10)], (error, results) => {
        if (error) {
            console.error('Error fetching bookings:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results);
    });
});

app.get('/deliveries', (req, res) => {
    const { date, operatorID } = req.query;

    if (!operatorID || !date) {
        return res.status(400).json({ error: 'Missing operatorID or date' });
    }

    console.log('Received operatorID:', operatorID);  
    console.log('Received date:', date);

    const query = `
        SELECT
            b.bookingID AS id,
            t.clientName,
            CONCAT(t.fromLatitude, ", ", t.fromLongitude) AS fromCoords,
            CONCAT(t.toLatitude, ", ", t.toLongitude) AS toCoords,
            b.finalFee,
            b.status  -- Ensure this field is selected
        FROM
            booking b
        JOIN
            transaction t ON b.transactionID = t.transactionID
        WHERE
            t.startDate = ? AND
            b.operatorID = ? AND
            b.status = 'Pending';  -- Ensure this filter is applied
    `;

    pool.query(query, [date, operatorID], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log('Query results:', results);  
        res.json(results);
    });
});
app.get('/getOperatorID', (req, res) => {
    const { premiumUserID } = req.query;

    if (!premiumUserID) {
        return res.status(400).json({ error: 'premiumUserID is required' });
    }

    pool.query('SELECT operatorID FROM operator WHERE premiumUserID = ?', [premiumUserID], (error, results) => {
        if (error) {
            console.error('Error fetching operator ID:', error.message);
            return res.status(500).json({ error: 'Internal server error', details: error.message });
        }

        if (results.length > 0) {
            res.json({ operatorID: results[0].operatorID });
        } else {
            res.status(404).json({ error: 'Operator ID not found' });
        }
    });
});

app.get('/delivery/:bookingID', (req, res) => {
    const { bookingID } = req.params;

    const query = `
        SELECT
            b.bookingID AS id,
            t.clientName,
            CONCAT(t.fromLatitude, ", ", t.fromLongitude) AS fromCoords,
            CONCAT(t.toLatitude, ", ", t.toLongitude) AS toCoords,
            b.finalFee,
            t.notes AS notes,         -- Ensure this field is included
            CONCAT(t.fromLatitude, ", ", t.fromLongitude) AS fromAddress,
            CONCAT(t.toLatitude, ", ", t.toLongitude) AS toAddress
        FROM
            booking b
        JOIN
            transaction t ON b.transactionID = t.transactionID
        WHERE
            b.bookingID = ?;
    `;

    pool.query(query, [bookingID], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        res.json(results[0]);
    });
});

app.put('/update-Deliverystatus', (req, res) => {
    const { deliveryId, status } = req.body;

    pool.query('UPDATE booking SET status = ? WHERE bookingID = ?', [status, deliveryId], (err, results) => {
        if (err) {
            console.error('Error updating delivery status:', err);
            return res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(200).json({ message: 'Delivery status updated successfully' });
        }
    });
});

app.get('/completedBookings', (req, res) => {
    const { userType, premiumUserID, operatorID } = req.query;

    if (!userType || !premiumUserID) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }

    let query = `
        SELECT 
            b.bookingID,
            t.clientName,
            t.startDate,
            t.endDate,
            t.expectedFee,
            b.finalFee,
            t.transactionID,
            b.status,
            b.operatorID,
            b.ownerID
        FROM booking b
        JOIN transaction t ON b.transactionID = t.transactionID
        WHERE b.status = 'completed'
    `;
    const queryParams = [];

    if (userType === 'owner') {
        query += ' AND b.ownerID = ?';
        queryParams.push(premiumUserID);
    } else if (userType === 'operator') {
        query += ' AND t.operatorID = ?';
        queryParams.push(operatorID);
    }

    pool.query(query, queryParams, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
});

app.get('/pendingBookings', (req, res) => {
    const { userType, premiumUserID, operatorID } = req.query;

    if (!userType || !premiumUserID) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }

    let query = `
        SELECT 
            b.bookingID,
            t.clientName,
            t.startDate,
            t.endDate,
            t.expectedFee,
            b.finalFee,
            t.transactionID,
            b.status,
            b.operatorID,
            b.ownerID
        FROM booking b
        JOIN transaction t ON b.transactionID = t.transactionID
        WHERE b.status = 'pending'
    `;
    const queryParams = [];

    if (userType === 'owner') {
        query += ' AND b.ownerID = ?';
        queryParams.push(premiumUserID);
    } else if (userType === 'operator') {
        query += ' AND t.operatorID = ?';
        queryParams.push(operatorID);
    }

    pool.query(query, queryParams, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
});

app.get('/bookingDetails/:bookingID', (req, res) => {
    const { bookingID } = req.params;

    if (!bookingID) {
        return res.status(400).json({ error: 'Booking ID is required' });
    }

    const query = `
        SELECT
            b.bookingID,
            b.transactionID,
            b.operatorID,
            b.ownerID,
            t.clientName,
            t.itemDescription,
            t.packageWeight,
            t.itemQuantity,
            t.vehicleFee,
            t.notes,
            t.first2km,
            t.succeedingKm,
            t.expectedDistance,
            t.startDate,
            t.endDate,
            t.expectedDuration,
            t.expectedFee,
            op.firstName AS operatorFirstName,
            op.lastName AS operatorLastName,
            op.email AS operatorEmail
        FROM
            booking b
            JOIN transaction t ON b.transactionID = t.transactionID
            JOIN operator o ON b.operatorID = o.operatorID
            JOIN premiumUser op ON o.premiumUserID = op.premiumUserID
        WHERE
            b.bookingID = ?;
    `;

    pool.query(query, [bookingID], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Failed to fetch booking details' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(results[0]);
    });
});

app.get('/weekly-sales', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting database connection:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        connection.query(`
            SELECT
                DATE(t.startDate) AS date,
                SUM(b.finalFee) AS totalSales,
                COUNT(*) AS totalDeliveries,
                SUM(t.itemQuantity) AS totalItems,
                AVG(b.finalFee) AS averageSalesPerDay,
                MAX(b.finalFee) AS highestSalesDay,
                MIN(b.finalFee) AS lowestSalesDay
            FROM
                booking b
                JOIN transaction t ON b.transactionID = t.transactionID
            WHERE
                t.startDate >= CURDATE() - INTERVAL 7 DAY
            GROUP BY
                DATE(t.startDate)
            ORDER BY
                DATE(t.startDate) ASC
        `, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                connection.release();
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Calculate additional metrics
            const totalSales = results.reduce((acc, day) => acc + day.totalSales, 0);
            const totalDeliveries = results.reduce((acc, day) => acc + day.totalDeliveries, 0);
            const averageSalesPerDay = totalSales / 7;
            const highestSalesDay = Math.max(...results.map(day => day.highestSalesDay));
            const lowestSalesDay = Math.min(...results.map(day => day.lowestSalesDay));

            connection.release();
            res.json({
                data: results,
                metrics: {
                    totalSales,
                    totalDeliveries,
                    averageSalesPerDay,
                    highestSalesDay,
                    lowestSalesDay
                }
            });
        });
    });
});




module.exports = app;
