// try to make sure multiple players dont take the same username
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const PlayerClass = require('./server/PlayerClass');
let playerList = {};
let action = -1;
let card = 0;

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
      game = new PlayerClass.Board(playerList);
      game.setup();
      io.emit('turn start', game.getWhosTurn());
    }
  });
  socket.on('draw', function(name) { 
    act(0, name)
  });
  socket.on('discard', function(name) {
    act(1, name)
  });
  socket.on('play', function(name) {
    act(2, name)
  });
  socket.on('destroy', function(name) {
    act(3, name)
  });
  socket.on('pass', function(name) {
    act(4, name);
  });
  socket.on('undo', function(name) {
    game.undo();
  });
  socket.on('end', function(name) {
    act(5, name);
  });
});
function act(i, name){
  console.log(game.getTurn(), name)
  if (name == game.getTurn()){
    game.action(i)
  }
  io.emit('phase', game.getPhase(), game.getTurn())
  if (game.getPhase()==1 ){ 
    console.log('switched turns')
    io.emit('turn start', game.getWhosTurn());
  }
}


http.listen(8080, () => {
  console.log('listening on *:8080');
});