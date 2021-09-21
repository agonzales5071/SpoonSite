const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors:{
      origins: ["*"],
  
  handlePreflightRequest: (req, res) => {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST",
      "Access-Control-Allow-Headers": "my-custom-header",
      "Access-Control-Allow-Credentials": true,
    });
    res.end();
  }}
});

io.on('connection', (socket) => {
  console.log('we have a connection!');

  socket.on('disconnect', () => {
    console.log('User had left!!!');
  })
});

app.use(router);
app.use(cors);
server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
