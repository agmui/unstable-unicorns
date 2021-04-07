/*useful links:
https://www.unicornsdatabase.com/
https://github.com/kedarv/unstable/blob/master/src/data.json
https://static.wikia.nocookie.net/unstableunicorns/images/1/18/336.png/revision/latest?cb=20190418002346*/
/*
extra rules when playing with 2 players
add neigh exseption
*/

const e = require('express');
const { copyFileSync } = require('fs');
deck = require('./data.json');
const cardAuto = require('./card.js');

class Card {
    constructor(name, text, type, img) {
        this.name = name;
        this.text = text;
        this.type = type;
        this.img = img;
    }
}

class Player {
    constructor(username) {
        this.name = username;
        this.hand = [];
        this.stable = [];
    }
    addCard(card, where) { // card should be a list
        if (where == "Hand") {
            this.hand = this.hand.concat(card);
        } else if (where == "Stable") {
            this.stable = this.stable.concat(card)
        }
    }
    removeCard(card, where) {
        if (where == "Hand") {
            for (let i = 0; i < this.hand.length; i++) {
                for (let j = 0; j < card.length; j++) {
                    if (this.hand[i].name == card[j].name) {
                        this.hand.splice(i, 1)
                        return
                    }
                }
            }
            console.log('class.js: not in domain')
            return null
        } else if (where == "Stable") {
            for (let i = 0; i < this.stable.length; i++) {
                for (let j = 0; j < card.length; j++) {
                    if (this.stable[i].name == card[j].name) {
                        this.stable.splice(i, 1)
                        return
                    }
                }
            }
            console.log('class.js: not in domain')
            return null
        }
    }
    checkHandNum() {
        return this.hand.length > 7;
    }
    winCondition() {
        return this.stable.length >= 7;
    }
    getName() {
        return this.name;
    }
    getHand() {
        return this.hand;
    }
    getHandStr(){
        let l = []
        for (let i of this.hand){
            l.push(i.name)
        }
        return l
    }
    getStable() {
        return this.stable;
    }
    getStableStr(){
        let l = []
        for (let i of this.stable){
            l.push(i.name)
        }
        return l
    }
}

class Board {
    constructor(playerNames) {
        this.log = []
        this.players = []
        for (var i in playerNames) {
            this.players.push(new Player(playerNames[i]))
        }
        this.deck = []
        this.discard = []
        for (let i = 0; i < deck.length; i++) {//improve
            this.deck.push(deck[i].quantity)
        }
        //this.turn = getRandomInt(this.players.length)
        //==debug==
        this.turn = 0//getRandomInt(this.players.length)
        //=========
        this.phase = 1;
        this.sendPic = [];
        this.bypass = [];
    }
    //returns a list of card objects
    drawFromDeck(num = 1) { // fix if deck run out of cards
        let final = []
        for (let index = 0; index < num; index++) {
            do {
                var x = getRandomInt(deck.length);
            } while (this.deck[x] == 0);
            this.deck[x]--
            final.push(new Card(deck[x].name, deck[x].text, deck[x].type, deck[x].img))
        }
        return final
    }
    drawFromDiscard() {
        return [this.discard[getRandomInt(this.discard.length)]]
    }
    setup() {
        this.players.forEach(p => {
            //this.move(p.getName(), this.drawFromDeck(7), "deck", [p.getName(), "Hand"], false, true);
            //debug
            //let card = new Card('controlled destruction', 'test', 'test', 'Controlled_Destruction.png')
            let card = new Card('basic unicorn', 'test', 'test', 'Guardsman_Unicorn.png')
            this.move(p.getName(), card, "deck", [p.getName(),"Hand"], false, true);//ts
            this.move(p.getName(), this.drawFromDeck(1), "deck", [p.getName(),"Stable"], false, true);//ts
        })
    }
    //parm card should be a list
    addCard(card, where) {//adds a card to deck or discard
        if (where == "deck") {
            this.deck = this.deck.concat(card);
        } else if (where == "discard") {
            this.discard = this.discard.concat(card);
        }
    }
    //parm card should be a list
    removeCard(card, where) {// removes a card from deck or discard
        if (where == "deck") {
            for (let i = 0; i < this.deck.length; i++) {
                for (let j = 0; j < card.length; j++) {
                    if (this.deck[i].name == card[j].name) {
                        this.deck.splice(i, 1)
                        return
                    }
                }
            }
            //console.log('class.js: not in domain')
            //return null //fix
        } else if (where == "discard") {
            for (let i = 0; i < this.discard.length; i++) {
                for (let j = 0; j < card.length; j++) {
                    if (this.discard[i].name == card[j].name) {
                        this.discard.splice(i, 1)
                        return
                    }
                }
            }
            //console.log('class.js: not in domain')
            //return null//fix
        }
    }
    card(game, request, name, card, affectedCards=false, affectedPlayers=false){//optimize
        return cardAuto.main(game, request, name, card, affectedCards, affectedPlayers)
    }
    //name, from, and to are all Strings exsept for when player is passed
    //when player is passed it is a list with [name, Hand/Stable]
    //bypass is to let game move anything anwhere, server.js cant accept bypass parma for security
    move(name, card, from, to, undo = false, bypass = false) { // params card CAN be a list or Card object
        if (name == this.bypass[this.bypass.length - 1]) this.bypass.pop()// checks bypass list for the most resent name to check if bypass is allowed
        else if (undo) { this.bypass.pop() }//if move call is an undo then can bypass (this could cause error if more than one bypass => undo)
        else if (name != this.getTurn() && bypass == false) {//to prevent anyone from going out of turn
            console.log('class.js: not players turn');
            return false
        }
        else if (this.bypass.length > 0) return false// ensures that once inturupt is pressed noone else can go
        console.log('class.js: ' + name + " moved " + card.name + " from " + from + " to " + to, to[0].name, to[1])
        if (card == 'random') {
            card = (from == 'deck') ? this.drawFromDeck(1) : this.drawFromDiscard();
        }
        if (card instanceof Array == false) {// check if card param is a list
            card = [card]
        }
        for (let i = 0; i < card.length; i++) { // check if objects inside list are cards
            if (card[i] instanceof Card == false) {
                card[i] = new Card(card[i].name, card[i].text, card[i].type, card[i].img)
            }
        }
        let index
        switch (from) {
            case "deck":
                //checks if card is in domain
                if(this.removeCard(card, from)===null) return false
                if (to != "discard" || to != "deck") {
                    if (to == 'Hand' || to == 'Stable') {
                        to = [name, to]
                    }
                    this.sendPic.push({//tell server.js a card has been moved from deck
                        card: card,
                        to: to
                    })
                }
                break
            case "discard":
                //checks if card is in domain
                if(this.removeCard(card, from)===null) return false
                if (to == 'Hand' || to == 'Stable') {
                    to = [name, to]
                }
                if (to != "discard" || to != "deck") {
                    this.sendPic.push({//tell server.js a card has been moved from discard
                        card: card,
                        to: to
                    })
                }
                break
            case "Hand":
            case "Stable":
                for (let i of this.players) {
                    if (i.getName() == name) {
                        //checks if card is in domain
                        if(i.removeCard(card, from)===null)return false
                        break
                    }
                }
                break
            default://if opponate is returned
                //checks if card is in domain
                index = this.players.findIndex((player) => player.getName() == from[0])
                if(this.players[index].removeCard(card, from[1])===null) return false
        }
        switch (to) {
            case "deck":
                this.addCard(card, to)
                break
            case "discard":
                this.addCard(card, to)
                break
            case "Hand":
            case "Stable":
                for (let i of this.players) {
                    if (i.getName() == name) {
                        i.addCard(card, to)
                        break
                    }
                }
                break
            default://if opponate is returned
                index = this.players.findIndex((player) => player.getName() == to[0])
                this.players[index].addCard(card, to[1])
        }
        for (let i of this.players) {// checks every move if someone wins, if true return username
            if (i.winCondition()) {
                console.log('Class.js: game over')
                return i;
            }
        }
        if (undo == false) this.log.push([name, card, from, to, this.getPhase()]);
    }
    // looks at the most recent action in log and undoes it
    // when going back a whole phase does not undo any moves yet
    undo(username) {//undo could change more than card
        if (this.log.length == 0) {
            console.log('class.js: end of log no more undo')
            return 'end';
        }
        let name = this.log[this.log.length - 1][0]
        let card = this.log[this.log.length - 1][1]
        let from = this.log[this.log.length - 1][2]
        let to = this.log[this.log.length - 1][3]
        let phase = this.log[this.log.length - 1][4]
        console.log("class.js:", username, "undid a move, last action was: " + name, 'moved', card[0].name, 'from', from, 'to', to)
        if (phase != this.phase) {//when undo goes back a phase
            console.log('undo back one phase')
            this.phase = phase;
            return false
        }
        this.log.pop()
        return { name: name, card: card, from: from, to: to }
    }
    //alows other player(single) to make actions cutting temp breaking the turns
    //askes for toWho break to as a string
    interupt(toWho) {
        console.log('class.js: recived interupt', toWho);
        this.bypass.push(toWho);
    }
    rotateTurn() {
        //rotates to next player's turn
        this.turn++
        if (this.phase != 5) {// probs can del
            console.log("error: not end phase")
            return
        }
        this.phase = 1
        this.log = []
        if (this.turn > this.players.length - 1) {
            this.turn = 0
        }
        return this.players[this.turn].getName();
    }
    //could have vulnerability when going form phase 4 => 5 could send move request
    rotatePhase() {//fix
        this.phase++
        if (this.phase >= 4 && this.getTurn(true).checkHandNum()) {// try to merge with bottom
            if (this.phase == 5) {//prevent player from going to next phase without discarding the right amount
                this.phase--
            }
            console.log('class.js:', this.getTurn(), 'has to many cards')
            return { numOfCards: this.getTurn(true).getHand().length - 7 }
        }
        //ts
        switch (this.phase) {
            //beginning of turn phase check
            case 1:
                //check for preturn start card effects
                break
            //draw phase
            case 2:
                console.log('game draws card for player')
                //this.move(p.getName(), this.drawFromDeck(1), "deck", [.getName(),"Hand"], false, true);//ts
                this.rotatePhase()//ts idk help
                break
            //ask for action
            case 3:
                console.log('draw or play')
                break
            //end of turn phase check
            case 4:
                // check for end of turn card effects
                break
        }
        //==
        return this.phase;
    }
    getPhase() {
        return this.phase;
    }
    //can spesify if it returns str or obj
    getTurn(str) {
        if (str) return this.players[this.turn];
        return this.players[this.turn].getName();
    }
    getPlayer(name){
        for (let i of this.players){
            if (i.name===name) return i
        }
    }
    //ask for visabliaty when getting state of domains
    getState(name, other = false) { // could be improved to find the only change and send that
        let userHand = [];//fix
        let userStable = [];
        let list = [];
        let OpponateHand = [];
        let OpponateStable = [];
        let test = []
        if (other) {
            other = this.getDeckOrDiscard(other)//other can provide spsfication on what is visiable
        }
        for (let element of this.players) {
            if (element.getName() == name) {
                for (let i of element.getHand()) {
                    userHand.push(i)
                }
                for (let i of element.getStable()) {
                    userStable.push(i)
                }
            } else {
                list.push(element.getName())
                test = []
                for (let i of element.getHand()) {
                    test.push(i)
                }
                OpponateHand.push(test)
                test = []
                for (let i of element.getStable()) {
                    test.push(i)
                }
                OpponateStable.push(test)

            }
        };
        let send = {
            PlayerHand: userHand,
            PlayerStable: userStable,
            OpponateList: list,
            OpponateHand: OpponateHand,
            OpponateStable: OpponateStable,
            DeckandDiscard: other
        }
        return send
    }
    getDeckOrDiscard(deckOrDis) {
        console.log('class.js: sent ' + deckOrDis)
        return deckOrDis === 'deck' ? deck : this.discard
    }
}

function getRandomInt(max) { // merge with the drawFromDeck function
    return Math.floor(Math.random() * Math.floor(max));
}

module.exports = { Board }

if (require.main === module) {
    let list = {'longString1':'host','longString2':'a'};
    let game = new Board(list);
    game.setup();
    game.players[0].getHand()[0].name = 'controlled destruction'//ts
    game.move('a', game.drawFromDeck(), 'deck', 'Stable', false, true)
    console.log("==setup over==\n");
    //==========
    console.log(game.getState('host'))
    console.log('phase:',game.getPhase())
    game.rotatePhase()//help
    let output = game.card(game, 'get', 'host', game.players[0].getHand()[0])
    console.log(game.getState('host'))
    console.log('phase:',game.getPhase())
    console.log('card.js output:', output)
    //some gui magic with fillingout output
    game.card(game, 'reply', 'a', game.players[0].getStable()[0], [game.players[1].getStable()[0]])
    console.log(game.getState('host'))
}