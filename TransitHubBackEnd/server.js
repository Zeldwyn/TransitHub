require('dotenv').config();

const http = require('http');
const app = require("./app");
const { setupSocket } = require("./socket"); 

const port = 8080;

const server = http.createServer(app);
setupSocket(server); 

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
