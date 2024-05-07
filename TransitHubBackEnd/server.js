//server.js

require('dotenv').config();

const app = require("./app");

const port = 8080;
app.listen(port, () => console.log(`Listening to port ${port}`))