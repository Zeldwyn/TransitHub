// socket.js

const { Server } = require('socket.io');
const { pool } = require('./database');

let io;

const setupSocket = (server) => {
  const io = require('socket.io')(server, {
      cors: {
          origin: "http://localhost:8080"
      }
  });

  io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('join_conversation', (data) => {
          const { conversationID } = data;
          socket.join(conversationID);
      });

      socket.on('send_message', (message) => {
          console.log('Message received:', message);
          saveMessageToDatabase(message);
          io.to(message.conversationID).emit('message', message);
      });

      socket.on('disconnect', () => {
          console.log('A user disconnected');
      });
  });
};
const saveMessageToDatabase = (message) => {
  const { conversationID, ownerID, operatorID, userType, text , created_at} = message;
  const sql = `INSERT INTO message (conversationID, ownerID, operatorID, userType, text, created_at) VALUES (?, ?, ?, ?, ?, ?)`;
  pool.query(sql, [conversationID, ownerID, operatorID, userType, text, created_at], (err, result) => {
      if (err) {
          console.error('Error saving message to database:', err);
      } else {
          console.log('Message saved to database:', message);
      }
  });
};


module.exports = { setupSocket };
 // useEffect(() => {
  //   fetch(`http://192.168.1.6:8080/get-Messages`, {
  //     method: 'POST',
  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       'conversationID': parseInt(currentConversation),
  //     })
  //   })
  //   .then(response => response.json())
  //     .then(data => {
  //       setMessages(data.results);
  //       setNewMessage('');
  //     })
  //   .catch(error => {
  //     console.error('Error posting data to Express backend:', error);
  //   });
  // }, [currentConversation]);