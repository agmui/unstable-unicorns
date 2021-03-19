// try to make sure multiple players dont take the same username
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const PlayerClass = require('./server/PlayerClass');
let playerList = {};
let test = false
let start_game = false

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
  console.log('user '+socket.id+' joined');
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  socket.on('disconnect', () => { // when player dc remove from numOfPlayer list
    console.log('user disconnected'+ ', playerList: ', playerList);
    delete playerList[socket.id];
  });
  socket.on('username input', function(name) { 
    let taken = false
    for (var i in playerList) {// make it so that people cant share the same username
      if (playerList[i] == name){
          taken = true
      }
    }
    if (taken == false) {
      console.log(name + " set username " + socket.id);
      io.emit('chat message', name + " joined the game")
      playerList[socket.id] = name;
      console.log('playerList: ', playerList)
    }
  });
  socket.on('ready', function(name){// make it so when everyone clicks ready then start
    if (name == 'host'){ // make the host the first person who joins and can be switchable
      io.emit('num of players', playerList)
      start_game = true
    }
  });
  socket.on('draw', function(name) {
    console.log(name + " drew a card");
    test = true
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
  socket.on('next', function(name) {
    if (start_game) {
      console.log('--game start--')
      PlayerClass.main(playerList, test)
      test = false
    }
  });
});


http.listen(8080, () => {
  console.log('listening on *:8080');
});