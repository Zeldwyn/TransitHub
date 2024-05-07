//app.js mga SQL statements and routes for API call sa backend
const express = require('express');
const cors = require('cors');
const {sendOTP} = require('./mail');
const {generateOTP} = require('./functions');
const {pool} = require('./database');

const app = express();

app.use(express.json());
app.use(cors());

// let storedOTP = "123456";
// let storedEmail = "johnmichael4@gmail.com";
let storedOTP;
let storedEmail;

app.post('/send-OTP', async (req, res) => { 
    const { email } = req.body;
    storedEmail = email;
    try {
        storedOTP = generateOTP();
        await sendOTP({ email, otp: storedOTP}); 
        res.status(200).json({ message: 'OTP sent successfully' }); 
    } catch (error) {
        console.error(error); 
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

app.post('/verify-OTP', async (req, res) => {
    const {otp} = req.body;
    // let otp = "123456";
    try {
        if(otp === storedOTP) {
            res.status(200).json({ message: 'VALID OTP' });
        } else {
            res.status(400).json({ error: 'Invalid OTP' });
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
    const {firstName, lastName, password} = req.body;
    
    const sql = `INSERT INTO premiumUser (email, firstName, lastName, password) VALUES (?, ?, ?, ?)`;
    pool.query(sql, [storedEmail, firstName, lastName, password], (err, result) => {
        if (err) {
            console.error('Error adding premium user:', err);
            res.status(200).json({ message: 'Login Successsful' }); 
        } else {
            console.log('Premium user added successfully');
            res.status(500).json({ error: 'Invalid Login Credentials' }); 
        }
    });
});

app.post('/validate-Login', async (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT email, password FROM premiumUser WHERE email = ? AND password = ?`;
    pool.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('Error validating login (Server Side Error):', err);
            res.status(500).json({ success: false, error: 'Internal server error' });
        } else {
            if (result.length > 0) {
                console.log('Login successful');
                res.status(200).json({ success: true });
            } else {
                console.log('Invalid login credentials');
                res.status(401).json({ success: false, error: 'Invalid login credentials' });
            }
        }
    });
});


module.exports = app;

