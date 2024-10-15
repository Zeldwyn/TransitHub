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

    //tried to combine transithubadmin and backend in 1 but failed miserably, so i just created 2 services
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke! Or did it? jk... or am I?');
});

app.post('/send-OTP', async (req, res) => { 
    const { email } = req.body;
    const sql = `SELECT email FROM premiumuser WHERE email = ?`;
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
    const { firstName, lastName, password, userType } = req.body;
    const email = req.session.email;

    if (!email) {
        return res.status(400).json({ error: 'No email found in session' });
    }

    const sql = `INSERT INTO premiumuser (email, firstName, lastName, password, userType) VALUES (?, ?, ?, ?, ?)`;
    
    pool.query(sql, [email, firstName, lastName, password, userType], (err, result) => {
        if (err) {
            console.error('Error inserting into premiumuser:', err);
            return res.status(500).json({ error: 'Fail adding Premium User' });
        }

        getPremiumID(email, (exists, premiumUserID) => {
            if (!exists) {
                return res.status(500).json({ error: 'Failed to retrieve Premium User ID' });
            }

            setUser(userType, premiumUserID, (success) => {
                if (success) {
                    console.log('Successful setUser');
                    return res.status(200).json({ success: true });
                } else {
                    console.log('Unsuccessful setUser');
                    return res.status(500).json({ error: 'Failed to assign user role' });
                }
            });
        });
    });
});

app.post('/validate-AdminLogin', (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT username, password, email, firstname, lastname, phonenumber, adminUserID FROM adminuser WHERE username = ?`;

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
    const sql = `SELECT email, password, userType, premiumUserID FROM premiumuser WHERE email = ? AND password = ?`;
    
    pool.query(sql, [email, password], (err, result) => {
        if (err) {
            res.status(500).json({ success: false, error: 'Internal server error during login validation' });
        } else {
            if (result.length > 0) {
                console.log('Login successful');

                const userType = result[0].userType;
                const premiumUserID = result[0].premiumUserID;

                // Fetch operatorID for operator users
                if (userType === 'operator') {
                    const operatorSql = `SELECT operatorID FROM operator WHERE premiumUserID = ?`; 
                    pool.query(operatorSql, [premiumUserID], (err, operatorResult) => {
                        if (err) {
                            res.status(500).json({ success: false, error: 'Internal server error fetching operatorID' });
                        } else if (operatorResult.length > 0) {
                            res.status(200).json({
                                isValid: true,
                                userType: userType,
                                id: premiumUserID,
                                operatorID: operatorResult[0].operatorID, 
                            });
                        } else {
                            res.status(400).json({ success: false, error: 'No operatorID found for this user' });
                        }
                    });
                } 
                // Fetch ownerID for owner users
                else if (userType === 'owner') {
                    const ownerSql = `SELECT ownerID FROM owner WHERE premiumUserID = ?`;
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
                    // For other user types (e.g., premium), send the premiumUserID
                    res.status(200).json({
                        isValid: true,
                        userType: userType,
                        id: premiumUserID,
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
    const sql = `SELECT firstName, lastName, password FROM premiumuser WHERE premiumUserID = ?`;
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
    const sql = `UPDATE premiumuser SET firstName = ?, lastName = ?, password = ? WHERE email = ?`;
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
            const insertQuery = `INSERT INTO guestuser (deviceID) VALUES (?)`;
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
                    FROM Operatordetails od
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

                const sql2 = `SELECT * FROM operatordetails WHERE operatorID IN (?)`;
                pool.query(sql2, [operatorIDs], (err, operatordetails) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to retrieve operator details' });
                    }

                    res.status(200).json(operatordetails);
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

                const sql2 = `SELECT * FROM ownerdetails WHERE ownerID IN (?)`;
                pool.query(sql2, [ownerIDs], (err, ownerdetails) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to retrieve operator details' });
                    }

                    res.status(200).json(ownerdetails);
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
    pool.query('SELECT * FROM premiumuser', (err, results) => {
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
    pool.query('INSERT INTO premiumuser (firstName, lastName, email, password, userType) VALUES (?, ?, ?, ?, ?)', [firstName, lastName, email,password, userType], (err, results) => {
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
    pool.query('UPDATE premiumuser SET firstName=?, lastName=?, email=?, userType=? WHERE premiumUserID=?', 
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
    pool.query('SELECT * FROM premiumuser WHERE premiumUserID = ?', [premiumUserID], (err, results) => {
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
    pool.query('DELETE FROM premiumuser WHERE premiumUserID = ?', [userId], (err, results) => {
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

    const sql = `UPDATE adminuser SET username = ?, email = ?, password = ?, firstname = ?, lastname = ?, phonenumber = ?, role = ? WHERE adminUserID = ?`;
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

    const sql = `SELECT * FROM adminuser WHERE adminUserID = ?`;
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
                    const sql3 = `SELECT * FROM operatordetails WHERE operatorID IN (?)`;
                    pool.query(sql3, [availableOperators], (err, operatordetails) => {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to retrieve operator details' });
                        }

                        res.status(200).json(operatordetails);
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
            b.status,
            t.clientName,
            t.startDate,
            t.endDate,
            p.firstName AS operatorFirstName,
            p.lastName AS operatorLastName
        FROM
            booking b
            JOIN operator_owner oo ON b.operatorID = oo.operatorID AND b.ownerID = oo.ownerID
            JOIN operator op ON oo.operatorID = op.operatorID
            JOIN premiumuser p ON op.premiumUserID = p.premiumUserID
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
            b.status  
        FROM
            booking b
        JOIN
            transaction t ON b.transactionID = t.transactionID
        WHERE
            t.startDate = ? AND
            b.operatorID = ? AND
            b.status = 'Pending'; 
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
            b.status,
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

app.get('/getUserType', (req, res) => {
    const { premiumUserID } = req.query;
    if (!premiumUserID) {
        return res.status(400).json({ error: 'premiumUserID is required' });
    }
    pool.query('SELECT operatorID FROM operator WHERE premiumUserID = ?', [premiumUserID], (error, operatorResults) => {
        if (error) {
            console.error('Error fetching operator ID:', error.message);
            return res.status(500).json({ error: 'Internal server error', details: error.message });
        }
        if (operatorResults.length > 0) {
            return res.json({ userType: 'operator', operatorID: operatorResults[0].operatorID });
        }
        pool.query('SELECT ownerID FROM owner WHERE premiumUserID = ?', [premiumUserID], (ownerError, ownerResults) => {
            if (ownerError) {
                console.error('Error fetching owner ID:', ownerError.message);
                return res.status(500).json({ error: 'Internal server error', details: ownerError.message });
            }
            if (ownerResults.length > 0) {
                return res.json({ userType: 'owner', ownerID: ownerResults[0].ownerID });
            }
            return res.status(404).json({ error: 'User not found' });
        });
    });
});

app.get('/completedBookings', (req, res) => {
    const { userType, ownerID, operatorID } = req.query;

    if (!userType || (!ownerID && !operatorID)) {
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
        WHERE b.status = 'Completed'
    `;
    const queryParams = [];

    if (userType === 'owner') {
        query += ' AND b.ownerID = ?';
        queryParams.push(ownerID);
    } else if (userType === 'operator') {
        query += ' AND b.operatorID = ?';
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
    const { userType, ownerID, operatorID } = req.query;

    if (!userType || (!ownerID && !operatorID)) {
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
        WHERE b.status = 'Pending'
    `;
    const queryParams = [];

    if (userType === 'owner') {
        query += ' AND b.ownerID = ?';
        queryParams.push(ownerID);
    } else if (userType === 'operator') {
        query += ' AND b.operatorID = ?';
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
            JOIN premiumuser op ON o.premiumUserID = op.premiumUserID
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
                COUNT(*) AS totalUsers
            FROM
                premiumuser
            WHERE
                created_at >= CURDATE() - INTERVAL 7 DAY
        `, (error, userResults) => {
            if (error) {
                console.error('Error executing user query:', error);
                connection.release();
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            connection.query(`
                SELECT
                    DATE(t.startDate) AS date,
                    COUNT(*) AS totalDeliveries,
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
            `, (error, salesResults) => {
                if (error) {
                    console.error('Error executing sales query:', error);
                    connection.release();
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const totalDeliveries = salesResults.reduce((acc, day) => acc + day.totalDeliveries, 0);
                const highestSalesDay = Math.max(...salesResults.map(day => day.highestSalesDay || 0));
                const lowestSalesDay = Math.min(...salesResults.map(day => day.lowestSalesDay || 0));

                connection.release();
                res.json({
                    data: salesResults, 
                    metrics: {
                        totalUsers: userResults[0].totalUsers,
                        totalDeliveries,
                        highestSalesDay,
                        lowestSalesDay
                    }
                });
            });
        });
    });
});

app.get('/total-deliveries', (req, res) => {
    const query = `
        SELECT COUNT(*) AS totalDeliveries
        FROM booking b
        JOIN transaction t ON b.transactionID = t.transactionID
        WHERE b.status = 'Completed';`;

    pool.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching total deliveries' });
        } else {
            res.json({ totalDeliveries: results[0].totalDeliveries });
        }
    });
});

app.get('/total-sales', (req, res) => {
    const query = `
        SELECT SUM(b.finalFee) AS totalSales
        FROM booking b
        JOIN transaction t ON b.transactionID = t.transactionID
        WHERE b.status = 'Completed';`;

    pool.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching total sales' });
        } else {
            res.json({ totalSales: results[0].totalSales });
        }
    });
});

app.get('/average-delivery-distance', (req, res) => {
    const query = `
        SELECT AVG(t.expectedDistance) AS avgDistance
        FROM transaction t
        JOIN booking b ON t.transactionID = b.transactionID
        WHERE b.status = 'Completed';`;

    pool.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching average delivery distance' });
        } else {
            res.json({ avgDistance: results[0].avgDistance });
        }
    });
});

app.get('/average-feedback-rating', (req, res) => {
    const query = `
        SELECT AVG(rate) AS avgRating
        FROM feedback;`;

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching average feedback rating:', err);
            res.status(500).json({ error: 'Error fetching average feedback rating' });
        } else {
            const avgRating = results[0].avgRating;
            res.json({ avgRating: avgRating !== null ? avgRating : 0 });
        }
    });
});

app.get('/completedOperatorBookings', (req, res) => {
    const { userType, premiumUserID, operatorID } = req.query;
    
    let query = '';
    let values = [];
  
    if (userType === 'operator') {
        // Fetch completed bookings for the specific operator from bookingDetails view
        query = `SELECT * FROM bookingDetails WHERE operatorID = ? AND status = 'completed'`;
        values = [operatorID];
    } else if (userType === 'premium') {
        // Fetch completed bookings for premium user (only show records where the premium user owns the operator)
        query = `SELECT * FROM bookingDetails 
                 JOIN operator_owner ON bookingDetails.operatorID = operator_owner.operatorID
                 WHERE operator_owner.ownerID = ? AND status = 'completed'`;
        values = [premiumUserID];
    }
  
    pool.query(query, values, (error, results) => {
        if (error) {
            console.error('Error fetching completed bookings:', error);
            return res.status(500).json({ error: 'Failed to fetch completed bookings' });
        }
        res.json(results);
    });
});

app.get('/pendingOperatorBookings', (req, res) => {
    const { userType, premiumUserID, operatorID } = req.query;
  
    let query = '';
    let values = [];
  
    if (userType === 'operator') {
        // Fetch pending bookings for the specific operator from bookingDetails view
        query = `SELECT * FROM bookingDetails WHERE operatorID = ? AND status = 'pending'`;
        values = [operatorID];
    } else if (userType === 'premium') {
        // Fetch pending bookings for premium user (only show records where the premium user owns the operator)
        query = `SELECT * FROM bookingDetails 
                 JOIN operator_owner ON bookingDetails.operatorID = operator_owner.operatorID
                 WHERE operator_owner.ownerID = ? AND status = 'pending'`;
        values = [premiumUserID];
    }
  
    pool.query(query, values, (error, results) => {
        if (error) {
            console.error('Error fetching pending bookings:', error);
            return res.status(500).json({ error: 'Failed to fetch pending bookings' });
        }
        res.json(results);
    });
});

app.get('/operator-location/check/:operatorID', (req, res) => {
    const operatorID = req.params.operatorID;

    pool.query('SELECT latitude, longitude FROM operator_owner WHERE operatorID = ?', [operatorID], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Error checking operator location', error });
        }

        if (results.length > 0) {
            res.status(200).json({ exists: true, location: results[0] });
        } else {
            res.status(200).json({ exists: false });
        }
    });
});

app.put('/operator-location/update/:operatorID', (req, res) => {
    const operatorID = req.params.operatorID;
    const { latitude, longitude } = req.body;

    pool.query('UPDATE operator_owner SET latitude = ?, longitude = ? WHERE operatorID = ?', [latitude, longitude, operatorID], (error) => {
        if (error) {
            return res.status(500).json({ message: 'Error updating operator location', error });
        }
        res.status(200).json({ message: 'Location updated successfully' });
    });
});

app.post('/operator-location/insert', (req, res) => {
    const { operatorID, ownerID, latitude, longitude } = req.body;

    pool.query('INSERT INTO operator_owner (operatorID, ownerID, latitude, longitude) VALUES (?, ?, ?, ?)', [operatorID, ownerID, latitude, longitude], (error) => {
        if (error) {
            return res.status(500).json({ message: 'Error inserting operator location', error });
        }
        res.status(200).json({ message: 'Location inserted successfully' });
    });
});

app.get('/operator-location/:operatorID', (req, res) => {
    const operatorID = req.params.operatorID;
    const query = `SELECT latitude, longitude FROM operator_owner WHERE operatorID = ?`;

    pool.query(query, [operatorID], (error, results) => {
        if (error) {
            console.error('Error fetching operator location:', error);
            return res.status(500).json({ error: 'Failed to fetch operator location' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Operator not found' });
        }

        const operatorLocation = results[0];
        res.json({
            latitude: operatorLocation.latitude,
            longitude: operatorLocation.longitude
        });
    });
});

module.exports = app;
