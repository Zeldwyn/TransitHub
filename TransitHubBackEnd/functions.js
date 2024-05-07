//functions.js
function generateOTP() {
    const temp = Math.floor(Math.random() * 1000000);
    return temp.toString().padStart(6, '0'); 
};

module.exports = { generateOTP };