//mail.js
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    }
});


const sendOTP = async({email, otp}) => {
    return await transport.sendMail ({
        from: 'no-reply@example.com',
        to: email,
        text: `Your OTP is ${otp}`, 
        html: `<p>Your OTP is <strong>${otp}</strong></p>`,
    });
};

module.exports = {sendOTP};