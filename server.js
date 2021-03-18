// try to make sure multiple players dont take the same username
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
PlayerClass = require('./server/PlayerClass');

console.log(typeof PlayerClass)
console.log(PlayerClass.checkHandNum())

app.get('/', (req, res) => {
  res.sendFile(__dirname+'/client/index.html');
});

app.get('/client.js', (req, res) => {
  res.sendFile(__dirname+'/client/client.js');
});

app.get('/client.css', (req, res) => {
  res.sendFile(process.cwd()+'/client/client.css');
});

io.on('connection', (socket) => {
  console.log('user joined');
  socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  /*socket.on('chat message', function(msg) {
    console.log(msg);
  });*/
  socket.on('username input', function(name) {
    console.log(name + " set username");
    socket.emit('chat message', name + " set username")
  });
  socket.on('draw', function(name) {
    console.log(name + " drew a card");
  });
  socket.on('discard', function(name) {
    console.log(name + " discarded a card");
  });
  socket.on('play', function(name) {
    console.log(name + " played a card");
  });
  socket.on('destroy', function(name) {
    console.log(name + " destroyed a card");
  });
});


http.listen(8080, () => {
  console.log('listening on *:8080');
});