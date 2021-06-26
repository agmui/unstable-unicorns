const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const PlayerClass = require('./PlayerClass');
let playerList = {};
var fs = require('fs');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname , '..', 'client','index.html'));
});

app.get('/client.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client','client.js'));
});

app.get('/client.css', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client','client.css'));
});

//======debug code========
let name = 0;
//========================


io.on('connection', (socket) => {
    //======debug code========
    if (name > 0) {
        io.emit("DEBUG_autofill", "host");
        name = 0
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
    socket.on('username input', function (name) {
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
    socket.on('ready', function (name) { // make it so when everyone clicks ready then start
        if (name == 'host') { // make the host the first person who joins and can be switchable
            io.emit('num of players', playerList)
            game = new PlayerClass.Board(playerList);
            game.setup();
            io.emit('phase', game.rotatePhase(), game.getTurn())
            io.emit('turn start', game.getTurn());
            //io.emit('board update', update(name));
            boardUpdate()
        }
    });
    socket.on('getDeckOrDis', function (username, where, random = false) {//client askes for deck/discard img
        //random code not used
        if (random) {// can spesify if blind or visble deck/discard
            let card = (where === 'deck' ? game.drawFromDeck(1) : game.drawFromDiscard())
            io.emit('random card', card)//sends cards in either a list 
            return
        }
        let cards = game.getDeckOrDiscard(where)
        if (cards.length != 0) {//check if deck/discard runs out of cards
            sendPic(cards, [username, 'display'])
            return
        } io.emit('no cards', username);// if deck/discard runs out of cards
    });
    socket.on('pass', function (username) {
        console.log(username, 'passed')
    });
    socket.on('endPhase', function (username) {
        console.log('end phase')
        io.emit('phase', game.rotatePhase(), game.getTurn())
    });
    socket.on('endTurn', function (username) {
        if (game.getPhase() == 5) {
            console.log('switched turns')
            io.emit('turn start', game.rotateTurn());
        }
        io.emit('phase', game.getPhase(), game.getTurn()) //idk maybe not need if statment
        boardUpdate()
    });

    //auto fill card functions
    socket.on('play', function(name, card, location){//optimise
        //check if card is in right location
        card = game.findCard(card, location)//to use the servers version of the card
        if(card === null) {console.log(card); return}

        let output = game.card(game, 'play', name, card, location);
        if(output === null) return//if card.js throws an error
        
        //game.card might move card so location needs to be updated
        if (output.move[0]) location[1] = output.move[0].to[1]//could have prob cuz of list

        let tap = game.checkTapped(card, location)//check if card is in location
        if(tap === null) return//card has error or is already used

        if (tap === false){
            for (let i of output.move){//needs to be fixed depending on if tapped or not
                io.emit('move', i.name, i.card, i.from, i.to);
            }

            if(output.phase) io.emit('phase', output.phase, game.getTurn());
            boardUpdate()
            
            if(card.type === 'Magic'){
                //ping back to player options
                io.emit('recivedTapped', name, card, output, location)
            }
        } else if (tap===true){
            //ping back to player options
            io.emit('recivedTapped', name, card, output, location)
        }
    })

    socket.on('filledForm', function(name, card, affectedObjects, location){
        if(affectedObjects === {}) return
        card = game.findCard(card, location)//to use the servers version of the card
        let output = game.card(game, 'tapped', name, card, affectedObjects);
        if (output===null||typeof output === 'string')return//card.js checks if valid input
        //if input is invalid should emit recivedTapped again with error text
        for (let i of output.move){
            io.emit('move', i.name, i.card, i.from, i.to);
        }

        if(output.phase) io.emit('phase', output.phase, game.getTurn());
        boardUpdate()
    })

    //move functions
    socket.on('move', function (username, card, from, to, undo) {// move funciton only alows one card to be moved at a time plz fix
        console.log("server.js: recived move function", username, card.name, from, to)
        console.log('wtf======')//ts
        let state = game.move(username, card, from, to, undo)
        if (state == false) return//checking if move is alowed with class.js
        if (state) console.log('server.js: game over')
        io.emit("move", username, card, from, to, state);
        boardUpdate()
    });
    socket.on('undo', function (username) {//fix anyone can call for undo
        console.log('server.js:', username, 'undid a move')
        io.emit('undo', game.undo(username));// broadcast to all of the undid move, up to them how to change gui
        io.emit('phase', game.getPhase(), game.getTurn()) //idk maybe not need if statment
        boardUpdate()//checks to see if any new card img needs to be sent
    });
    socket.on('interupt', function (toWho) {
        console.log('server.js: interupt recived');
        game.interupt(toWho);
    });
    //sending pic over given card class in a list and where it is suppose to go
    function sendPic(picDir, where) {
        let imgFile;
        if (picDir) {// may not need if statment
            for (let i of picDir) {
                imgFile = i.img
                fs.readFile(__dirname + '/card_images/' + imgFile, function (err, buf) {
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
        if (game.sendPic != []) {
            for (let i of game.sendPic) {
                sendPic(i.card, i.to)
            }
            game.sendPic = []
        }
    }
});


http.listen(8080, () => {
    console.log('listening on *:8080');
});
