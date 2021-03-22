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
      io.emit('board update',game.getState(name));
    }
  });
  socket.on('undo', function (username){ 
    console.log(username,'undid a move')
    io.emit('board update',game.getState());
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
	io.emit('board update',game.getState(username));
  });
  //----------- sending pic over
  /*let readStream = fs.createReadStream(path.resolve(__dirname,'./server/card_images/Americorn.png'),{	
	  encoding: 'binary'
  }), chunks = [];

  readStream.on('readable', function(){
	  console.log('Image loading');
  })
  readStream.on('data', function(chunk){
	  console.log('===yay===')
	  chunk.push(chunk);
	  	io.emit('img-chunk', chunk)
  })
  readStream.on('end', function(){
	  console.log('Image loaded')
  })*/
  fs.readFile(__dirname + '/server/card_images/Americorn.png', function(err, buf){
    // it's possible to embed binary data
    // within arbitrarily-complex objects
	socket.emit('image', { image: true, buffer: buf.toString('base64') });
    console.log('image file is initialized');
  });
  //-----------
  //move functions
	socket.on('move', function(username, card, from, to) { 
		if (username == game.getTurn()){// may need to change getTurn for interupt cases or cut in line case
			console.log("server.js: recived move function", username, card, from, to)
			game.move(username, card, from, to)
			io.emit('board update',game.getState(username));
		}
	});
});


http.listen(8080, () => {
  console.log('listening on *:8080');
});