const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const rules = require('./game/Rules');
let playerList = {};
var fs = require('fs');
let game

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
    socket.on('debugPassOver', function (name) {
        io.emit('debugPassOver', name)
    })
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

    //================================Btns=============================================
    socket.on('ready', function (name) { // make it so when everyone clicks ready then start
        if (name == 'host') { // make the host the first person who joins and can be switchable
            io.emit('num of players', playerList)
            console.log('=======================')
            game = new rules.rules(playerList);
            game.setup();
            io.emit('turn start', game.getTurn());
            io.emit('phase', game.rotatePhase(), game.getTurn())
            boardUpdate()
        }
    });

    //TODO add checks to all btn
    socket.on('deckBtn', function(){
        //draws from deck
    });

    socket.on('passBtn', function(){
        //passes action or beginning of turn phase
        console.log('clicked on pass')
        io.emit('phase', game.rotatePhase(), game.getTurn())
    });

    socket.on('endPhaseBtn', function(){
        //ends phase *should not be needed
        console.log('clicked on end Phase')
        io.emit('phase', game.rotatePhase(), game.getTurn())
    });

    socket.on('endTurnBtn', function(){
        //ends turn
        console.log('clicked on end turn')
        if(game.rotateTurn()){
            io.emit('turn start', game.getTurn());
            io.emit('phase', game.rotatePhase(), game.getTurn())
        }
        //TODO send errer msg
    });

    //=======================popup==========================================
    //when client clicks on a card
    let selectedCard = {num:0}//to pass what card was selected to CardEffects function
    socket.on('clickCard', function(name, cardName, location){
        console.log('player:',name, 'clicked on:', cardName, 'at', location)
        sendPlay(name, cardName, location)
    });//fix the function is separated 
    function sendPlay(name, cardName, location){
        selectedCard = {
            name: name,
            cardName: cardName,
            location: location,
            num:selectedCard.num
        }
        if(location[0] === name) {//if it is player's own cards
            let form = game.play(name, cardName, location[1], selectedCard.num)
            if(form !== false){
                switch(form.type){
                    case 'discard':
                        form = {display: [{name:name, location:'Hand'}], type: form.type}
                        break
                    case 'sacrifice':
                        //display stable
                        form = {display: [{name:name, location:'Stable'}], type: form.type}
                        break
                    case 'destroy':
                        //display opp stable
                        let oppStable = []
                        for(let i of game.players){
                            if(i.name !== name) oppStable.push({name:i.name,location:'Stable'}) 
                        }
                        form = {display : oppStable, type: form.type}
                        break
                    case 'draw':
                        form = {confirm : 'justConfirm', type: form.type}
                        break
                    case 'steal':
                        //TODO
                        break
                    case 'bringBack':
                        io.emit('move', name, cardName, 'Hand', 'Stable', false)
                        //TODO
                        break
                    case 'trade':
                        io.emit('move', name, cardName, 'Hand', 'Stable', false)
                        //TODO
                        break
                    case 'use':
                        //for playing basic unicorns
                        form = {confirm:'justConfirm',type:form.type, location:'Hand', cardName:cardName}
                        break
                }
                io.emit('fill', form, name)
                console.log('sent form:', form)
            }
        } else {//may not be needed
            console.log('not in players hand')
        }
    }

    socket.on('filledForm', function(form){
        if(form) {
            console.log('recived form', form)//'ts
            let [validInput, moreAction, move] = game.CardEffect(selectedCard.name, selectedCard.cardName, selectedCard.location[1], form)
            //if valid output send back changes to client
            if(validInput){
                //update client
                if(move) {
                    for(let i of move){
                        io.emit('move', i.name, i.cardName, i.from, i.to, false)
                    }
                    boardUpdate()
                }

                //check if there are anymore actions
                if(moreAction){
                    console.log('more actions')
                    selectedCard.num++;
                    io.emit('accepted input', 'more actions')//tells client to keep popup
                    sendPlay(selectedCard.name, selectedCard.cardName, selectedCard.location)
                } else{
                    io.emit('accepted input', 'accepted')//tells client to close popup
                    //rotate phase if it is action phase
                    if(game.getPhase() === 3) io.emit('phase', game.rotatePhase(), game.getTurn())
                }
            } else {
                //send back error to client
                console.log('not valid input')
                io.emit('accepted input', false)
            }
        }
    })
    
    // =====================send imgs=================
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
        if (game.sendPic !== []) {
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
