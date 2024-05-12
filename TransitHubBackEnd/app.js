//app.js mga SQL statements and routes for API call sa backend
const express = require('express');
const cors = require('cors');
const {sendOTP} = require('./mail');
const {generateOTP} = require('./functions');
const {pool} = require('./database');

const app = express();

app.use(express.json());
app.use(cors());

let storedOTP = "123456";
// let storedEmail = "johnmichael4@gmail.com";
// let storedOTP;
let storedEmail = "nimeqt1@gmail.com";

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
                console.log('Okay ra doy');
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
            res.status(400).json({ error: 'Fail' }); 
        } else {
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
    const { email, password } = req.body;
    const sql = `UPDATE premiumUser SET password = ? WHERE email = ?`;
    pool.query(sql, [password, email], (err, result) => {
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

module.exports = app;

