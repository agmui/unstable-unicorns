const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const PlayerClass = require('./server/PlayerClass');
let playerList = {};
var fs = require('fs');

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
      io.emit('turn start', game.getTurn());
      //io.emit('board update', update(name));
      boardUpdate()
    }
  });
  socket.on('undo', function (username){ 
    console.log(username,'undid a move')
    //io.emit('board update',game.getState());
    boardUpdate()
  });
  socket.on('pass', function (username){ 
    console.log(username, 'passed')
  });
  socket.on('endPhase', function (username){ 
    console.log('end phase')
    io.emit('phase', game.rotatePhase(), game.getTurn())
  });
  socket.on('endTurn', function (username){ 
    if (game.getPhase()==5 ){ 
      console.log('switched turns')
      io.emit('turn start', game.rotateTurn());
    }
    io.emit('phase', game.getPhase(), game.getTurn())//idk maybe not need if statment
    boardUpdate()
  });
  //move functions
	socket.on('move', function(username, card, from, to) { 
		if (username == game.getTurn()){// may need to change getTurn for interupt cases or cut in line case
			console.log("server.js: recived move function", username, card, from, to)
			game.move(username, card, from, to)
			//io.emit('board update',game.getState(username));
      boardUpdate()
		}
	});
  //sending pic over
  function sendPic(picDir, where, forWho){
    if(picDir){
      for(let i of picDir){
        fs.readFile(__dirname + '/server/card_images/'+i, function(err, buf){
          io.emit('image', { image: true, buffer: buf.toString('base64') }, where, forWho);
        });
      }
    }
  }
  // sends pics of the updated board
  function boardUpdate(){// try to make it so it just sends the only pic that has been updated
    for ( let i in playerList){ 
      let pics = game.getState(playerList[i])
      sendPic(pics.PlayerHand, "PlayerHand", playerList[i])
      sendPic(pics.PlayerStable, "PlayerStable", playerList[i])
      for(let j = 0; j < pics.OpponateList.length; j++){
        sendPic(pics.OpponateHand[j], pics.OpponateList[j]+"Hand", playerList[i])
        sendPic(pics.OpponateStable[j], pics.OpponateList[j]+"Stable", playerList[i])
      }
    }
  }
});


http.listen(8080, () => {
  console.log('listening on *:8080');
});
