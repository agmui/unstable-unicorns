/*useful links:
https://www.unicornsdatabase.com/
https://github.com/kedarv/unstable/blob/master/src/data.json
https://static.wikia.nocookie.net/unstableunicorns/images/1/18/336.png/revision/latest?cb=20190418002346*/
//https://docs.google.com/spreadsheets/d/1pOji9_-2YIam2euNTGYeryaVBfRNrWstHDaLEe-fddU/edit#gid=889093624
/*
extra rules when playing with 2 players
add neigh exseption
recode everything without card param needing to be an array
optimize name, card, location param
*/

const colors = require('colors');
const e = require('express');
const { copyFileSync } = require('fs');
let deck = require('./data.json');
const cardAuto = require('./card.js');
const { count } = require('console');

class Card {
    constructor(name, text, type, img, effect, action) {
        this.name = name;
        this.text = text;
        this.type = type;
        this.img = img;
        this.tap = false;
        this.effect = effect
        this.action = action;
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
            this.hand = this.hand.concat(card); //fix
        } else if (where == "Stable") {
            this.stable = this.stable.concat(card)
        }
    }
    removeCard(card, where) {
        if(card instanceof Array === false) card = [card]
        for (let i of card){
            let c = this.findCardInPlayer(i, where, true)
            if ( c === null) return null
            if(where === 'Hand'){
                this.hand.splice(c[1], 1)
            } else if (where === 'Stable'){
                this.stable.splice(c[1], 1)
            }
        }
    }
    checkHandNum() {
        return this.hand.length > 7;
    }
    winCondition() {
        return this.stable.length >= 7;
    }
    findCardInPlayer(card, location=false, index=false){
        if(card.name) card = card.name
        if (location === 'Hand'){
            for (let i of this.getHand()){
                if (i.name === card) return (index) ? [i, this.hand.indexOf(i)] : i
            }
            console.log('Class.js: card not in hand')
            return null
        } else if (location === 'Stable'){
            for (let i of this.getStable()){
                if (i.name === card) return (index) ? [i, this.stable.indexOf(i)] : i
            }
            console.log('Class.js: card not in Stable')
            return null
        }
        else {//needs to be tested
            let output = this.findCardInPlayer(card, 'Hand')
            return (output === null) ? this.findCardInPlayer(card, 'Stable') : output
        }
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
        this.deckValue = []
        this.discard = []
        for (let i = 0; i < deck.length; i++) {//improve
            this.deckValue.push(deck[i].quantity)
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
            } while (this.deckValue[x] == 0);
            //this.deckValue[x]--//will be subtracted in move function
            final.push(new Card(deck[x].name, deck[x].text, deck[x].type, deck[x].img, deck[x].effect, deck[x].action))
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
            //let card = new Card('Glitter Bomb', 'test', 'Upgrade', 'Glitter_Bomb.png')
            //this.move(p.getName(), card, "deck", [p.getName(),"Hand"], false, true);

            let card = this.findCard('Glitter Bomb', 'deck')//new Card('Glitter Bomb', 'test', 'Upgrade', 'Glitter_Bomb.png')
            card = this.findCard('Unicorn Trap', 'deck')
            card = this.findCard('Charming Bardicorn', 'deck')
            this.move(p.getName(), card, "deck", [p.getName(),"Hand"], false, true);

            /*card = this.findCard('Charming Bardicorn', 'deck')//new Card('Glitter Bomb', 'test', 'Upgrade', 'Glitter_Bomb.png')
            this.move(p.getName(), card, "deck", [p.getName(),"Hand"], false, true);

            /*card = this.findCard('Controlled Destruction', 'deck')//new Card('Glitter Bomb', 'test', 'Upgrade', 'Glitter_Bomb.png')
            this.move(p.getName(), card, "deck", [p.getName(),"Hand"], false, true);
            */
            /*card = this.findCard('Unicorn Poison', 'deck')//new Card('Glitter Bomb', 'test', 'Upgrade', 'Glitter_Bomb.png')
            this.move(p.getName(), card, "deck", [p.getName(),"Hand"], false, true);
            //*/
            //this.move(p.getName(), this.drawFromDeck(1), "deck", [p.getName(),"Stable"], false, true);//ts
            card = this.findCard('The Great Narwhal', 'deck')//new Card('Glitter Bomb', 'test', 'Upgrade', 'Glitter_Bomb.png')
            //this.move(p.getName(), card, "deck", [p.getName(),"Stable"], false, true);
        })
        console.log('=========setup over=========')
    }
    //parm card should be a list
    addCard(card, where) {//adds a card to deck or discard
        if (where == "deck") {
            for (let i of card){
                let c = this.findCard(i, 'deck', true)
                if (c === null) return null
                this.deckValue[c[1]] ++ 
            }
        } else if (where == "discard") {
            this.discard = this.discard.concat(card);
        }
    }
    //parm card should be a list
    removeCard(card, where) {// removes a card from deck or discard
        for(let i of card){
            let c = this.findCard(i, where, true)
            if ( c === null) return null
            if(where === 'deck'){
                this.deckValue[c[1]]--//fix
            } else if (where=== 'discard'){
                this.discard.splice(c[1],1)//fix
            }
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
        if (card == 'random') {
            card = (from == 'deck') ? this.drawFromDeck(1) : this.drawFromDiscard();
        }
        if (card instanceof Array == false) {// check if card param is a list
            card = [card]
        }
        for (let i = 0; i < card.length; i++) { // check if objects inside list are cards
            if (card[i] instanceof Card == false) {
                card[i] = new Card(card[i].name, card[i].text, card[i].type, card[i].img, card[i].effect, card[i].action)
            }
        }
        let output = null
        console.log('class.js: ' + name + " moved " + card[0].name + " from " + from + " to " + to, to[0].name, to[1])
        switch (from) {
            case "deck":
            case "discard":
                //checks if card is in domain
                if(this.removeCard(card, from)===null) return false
                if (to != "discard" || to != "deck") {
                    if (to == 'Hand' || to == 'Stable') {
                        to = [name, to]
                    }
                    this.sendPic.push({//tell server.js a card has been moved from discard
                        card: card,
                        to: to
                    })
                }
                break
            case "Hand":
            case "Stable":
                if(this.getPlayer(name).removeCard(card, from) === null) return false
                break
            default://if opponate is returned
                //checks if card is in domain
                if(this.getPlayer(name).removeCard(card, from[1])===null) return false
        }
        switch (to) {
            case "deck":
            case "discard":
                this.addCard(card, to)
                break
            case "Stable":
                //when Unicorn cards enter the stable
                output = []
                for(let i of card){
                    console.log('Class.js:',i.effect)//ts
                    if(i.effect === 'enter') output = output.concat(['hi'])////==================
                }

            case "Hand":
                this.getPlayer(name).addCard(card, to)
                break
            default://if opponate is returned
                this.getPlayer(to[0]).addCard(card, to[1])
                    
                //when Unicorn cards enter the stable
                if(to[1] === 'Stable'){
                    output = []
                    for(let i of card){
                        console.log('Class.js:',i.effect)//ts
                        if(i.effect === 'enter') output = output.concat(['hi'])
                    }
                }
        }
        for (let i of this.players) {// checks every move if someone wins, if true return username
            if (i.winCondition()) {
                console.log('Class.js: game over')
                return i;
            }
        }
        if (output !== null)return output
        //if (undo == false) this.log.push([name, card, from, to, this.getPhase()]);
    }
    //returns card object
    //card should be a Card obj or string
    findCard(card,location, index=false) {
        if(card.name) card = card.name
        switch(location) {
            case undefined://if location param is not filled
                console.log("class.js: fill in location param")
                return null
            case "deck":
                for(let i =0; i < deck.length; i ++){
                    if (deck[i].name === card) {
                        return (index) ? [deck[i], i] : deck[i];
                    }
                }
                console.log('Class.js: error card not found in deck')
                return null;
            case "discard":
                for(let i of this.discard){
                    if (i.name === card) return (index) ? [i, this.discard.indexOf(i)] : i;
                }
                console.log('Class.js: error card not found in discard')
                return null;
            default://if array is returned
                return this.getPlayer(location[0]).findCardInPlayer(card, location[1], false)
        }
        
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
    checkTapped(card, location){//maybe not used
        //name (str), card (Card obj), location [name, location]
        if(card.type === 'Magic') return false
        let c = this.findCard(card, location)//this.getPlayer(name).findCardInPlayer(card, location[1])
        if(c === null) return null
        return c.tap
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
        return this.getTurn()//this.players[this.turn].getName();
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
    getState(name, str=false) { // could be improved to find the only change and send that
        let list = [];
        let OpponateHand = [];
        let OpponateStable = [];
        let test = []
        for (let element of this.players) {
            if (element.getName() == name) {
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
        let send = {//fix
            PlayerHand: this.getPlayer(name).getHandStr(),//userHand,
            PlayerStable: this.getPlayer(name).getStableStr(),
            OpponateList: list,
            OpponateHand: OpponateHand,
            OpponateStable: OpponateStable,
            Discard: this.getDeckOrDiscard("Discard")
        }

        if(str){
            let phase = '\nPhase:'+this.getPhase()
            console.log(phase.white.bold.bgGreen)
            let turn = 'Turn:'+this.getTurn()
            console.log(turn.white.bold.bgRed+'\n')

            console.log(name.white.bold.bgBlack)
            console.log('hand:',send.PlayerHand)
            console.log('stable:',send.PlayerStable,'\n')

            console.log(send.OpponateList[0].white.bold.bgBlack)
            console.log('hand:', this.getPlayer(send.OpponateList[0]).getHandStr())
            console.log('stable:', this.getPlayer(send.OpponateList[0]).getStableStr(),'\n')
            return
        }
        return send
    }
    getDeckOrDiscard(deckOrDis) {
        return deckOrDis === 'deck' ? deck : this.discard
    }
}

function getRandomInt(max) { // merge with the drawFromDeck function
    return Math.floor(Math.random() * Math.floor(max));
}


module.exports = { Board }

if (require.main === module) {
    /*let list = {'longString1':'host','longString2':'a'};
    let game = new Board(list);

    let cardName = 'Unicorn Trap'

    game.setup()
    let card = game.findCard(cardName, 'deck')
    game.move('host', card, "deck", ['host',"Hand"], false, true);

    card = game.findCard('Charming Bardicorn', 'deck')
    let output = game.move('host', card, "deck", ['a',"Stable"], false, true);
    //console.log('help------', output)

    game.getState('host', true)
    let affectedObjects =[{
        name: 'a',
        card: 'Charming Bardicorn' 
    }]
    card = game.findCard(cardName, ['host', 'hand'])
    game.card(game, 'tapped', 'host', card, affectedObjects)

    game.getState('host', true)*/

    cardTest()
}








function cardTest(){
    let list = {'longString1':'host','longString2':'a'};
    let game = new Board(list);
    game.setup()

    game.getState('host',true)

    game.rotatePhase()
    console.log('======\n')
    let card = game.findCard('Charming Bardicorn', ['host', 'hand'])
    game.card(game, 'play', 'host', card, 'bypass')

    game.getState('host',true)

}