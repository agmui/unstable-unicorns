const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const PlayerClass = require('./server/PlayerClass');
let playerList = {};
var fs = require('fs');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/client.js', (req, res) => {
    res.sendFile(__dirname + '/client/client.js');
});

app.get('/client.css', (req, res) => {
    res.sendFile(process.cwd() + '/client/client.css');
});

//======debug code========
let name=0;
//========================


io.on('connection', (socket) => {
    //======debug code========
    if (name>0){
        io.emit("DEBUG_autofill", "host");
        name=0
    } else {
        io.emit("DEBUG_autofill", "player1");
        name++
    }
    //========================

    console.log('user ' + socket.id + ' joined');
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => { // when player dc remove from numOfPlayer list
        console.log('user disconnected' + ', playerList: ', playerList);
        delete playerList[socket.id];
    });
    socket.on('username input', function(name) {
        let taken = false
        for (var i in playerList) { // make it so that people cant share the same username
            if (playerList[i] == name) {
                taken = true
            }
        }
        if (taken == false) {
            console.log(name + " set username " + socket.id);
            io.emit('chat message', name + " joined the game")
            playerList[socket.id] = name;
            console.log('playerList: ', playerList)
        } else {
            io.emit("That username is taken!");
        }
    });
    socket.on('ready', function(name) { // make it so when everyone clicks ready then start
        if (name == 'host') { // make the host the first person who joins and can be switchable
            io.emit('num of players', playerList)
            game = new PlayerClass.Board(playerList);
            game.setup();
            io.emit('turn start', game.getTurn());
            //io.emit('board update', update(name));
            boardUpdate()
        }
    });
    socket.on('getDeckOrDis', function(username, where, random=false){//client askes for deck/discard img
        //random code not used
        if (random){// can spesify if blind or visble deck/discard
            let card = (where === 'deck' ? game.drawFromDeck(1) : game.drawFromDiscard())
            io.emit('random card', card)//sends cards in either a list 
            return
        }
        let cards = game.getDeckOrDiscard(where)
        if (cards.length != 0){//check if deck/discard runs out of cards
            sendPic(cards, [username, 'display'])
            return
        } io.emit('no cards', username);// if deck/discard runs out of cards
    });
    socket.on('pass', function(username) {
        console.log(username, 'passed')
    });
    socket.on('endPhase', function(username) {
        console.log('end phase')
        io.emit('phase', game.rotatePhase(), game.getTurn())
    });
    socket.on('endTurn', function(username) {
        if (game.getPhase() == 5) {
            console.log('switched turns')
            io.emit('turn start', game.rotateTurn());
        }
        io.emit('phase', game.getPhase(), game.getTurn()) //idk maybe not need if statment
        boardUpdate()
    });
    //move functions
    socket.on('move', function(username, card, from, to, undo) {// move funciton only alows one card to be moved at a time plz fix
        if (username == game.getTurn()) { // may need to change getTurn for interupt cases or cut in line case
            console.log("server.js: recived move function", username, card.name, from, to)
            io.emit("move", username, card, from, to);
            game.move(username, card, from, to, undo)
            boardUpdate()
        }
    });
    socket.on('undo', function(username) {
        console.log(username, 'undid a move')
        io.emit('undo', game.undo(username));// broadcast to all of the undid move, up to them how to change gui
        boardUpdate()//checks to see if any new card img needs to be sent
    });
    //sending pic over given card class in a list and where it is suppose to go
    function sendPic(picDir, where) {
        let imgFile;
        if (picDir) {// may not need if statment
            for (let i of picDir) {
                imgFile = i.img
                fs.readFile(__dirname + '/server/card_images/' + imgFile, function(err, buf) {
                    io.emit('image', {
                        image: true,
                        buffer: buf.toString('base64')
                    }, where, i);
                });
            }
        }
    }
    // sends pics of the updated board
    function boardUpdate() {// make it so it does not have to loop though all players and just do one emit
        if (game.sendPic != []){
            for (let i of game.sendPic){
                sendPic(i.card, i.to)
            }
            game.sendPic=[]
        }
    }
});


http.listen(8080, () => {
    console.log('listening on *:8080');
});
