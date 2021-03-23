/*useful links:
https://www.unicornsdatabase.com/
https://github.com/kedarv/unstable/blob/master/src/data.json
https://static.wikia.nocookie.net/unstableunicorns/images/1/18/336.png/revision/latest?cb=20190418002346*/
/*
extra rules when playing with 2 players
add neigh exseption
*/

const e = require('express');

deck = require('./data.json');

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
    addCards(cards) { // takes card object in list form
        this.hand = this.hand.concat(cards)
        console.log(this.name+" added " + cards.length + " card(s) to hand")
    }
    discard(card){ // takes in index
        delete this.hand[card];
        console.log(this.name+" discared " + card)
    }
    play(card, player=false) { // could force a player to discard a card
        this.discard(card);
        if (player){
            player.play(card);
        } else {
            this.stable.push(card);
        }
        console.log(this.name+" played " + card)
    }
    // could destroy card from another player's stable
    destroy(card) { // removes card from stable
        delete this.stable[card];
        console.log(this.name + " got " + card + " removed")
    }
    //returnToHand function? and a deck to stable function and choose on card from deck to hand
    UaddCards(card){
        this.discard(card)
    }
    Udiscard(card){
        this.addCards(card)
    }
    Uplay(card, toWho){
        toWho.destroy(card)
    }
    Udestroy(card){
        this.play(card)
    }
    checkHandNum(){
        return this.hand.length>7;
    }
    winCondition(){
        return this.stable.length>=7;
    }
    getName() {
        return this.name;
    }
    getHand(){
        return this.hand;
    }
    getStable(){
        return this.stable;
    }
}

class Board {
    constructor(playerNames){
        this.log = []
        this.players = []
        for (var i in playerNames){
            this.players.push(new Player(playerNames[i]))
        }
        this.deck = []
        for (let i=0; i < deck.length; i++) {//improve
            this.deck.push(deck[i].quantity)
        }
        this.turn = getRandomInt(this.players.length)
        this.phase = 1;
    }
    //returns a list of card objects 
    drawFromDeck(num=1){ // fix if deck run out of cards
        let final = []
        for (let index = 0; index < num; index++) {
            do{
                var x = getRandomInt(deck.length);
            } while(this.deck[x]==0);
            this.deck[x] --
            final.push(new Card(deck[x].name, deck[x].text, deck[x].date, deck[x].img))
        }
        return final
    }
    setup(){
        //this.players[0].addCards(this.drawFromDeck(1))
        //this.players[1].addCards(this.drawFromDeck(1))
        this.players.forEach(p => {
            p.addCards(this.drawFromDeck(1))
        })
        /*this.players.forEach(p => {
            p.move(p, this.drawFromDeck(5), deck, hand);
        })*/
    }
    move(name, card, from, to){ // card, and to could be a list so make multiple input same function
        console.log('class.js: '+name + " moved " + card + " from " + from + " to " +to)

        this.log.push([name, card, from, to]);
        //this.updateGui(change)
    }
    // looks at the most recent action in log and undoes it
    undo(){//note acount if reseing action or entier phase
        let action = this.log[this.log.length-1][0]
        let card = this.log[this.log.length-1][1]
        let toWho = this.log[this.log.length-1][2]
        console.log("previos action was: "+action, toWho)
        this.log.pop()
        this.phase--;
        //this.updateGui(change)
    }
    rotateTurn(){
        //rotates to next player's turn
        this.turn++
        if (this.phase!=5){// probs can del
            console.log("error: not end phase")
            return
        }
        this.phase = 1
        if (this.turn>this.players.length-1){
            this.turn=0
        }
        return this.players[this.turn].getName();
    }
    rotatePhase(){
        this.phase++
        return this.phase;
    }
    getPhase(){
        return this.phase;
    }
    getTurn(){
        return this.players[this.turn].getName();
    }
    //ask for visabliaty when getting state of domains
    getState(name, other=false){ // could be improved to find the only change and send that
        let userHand = [];//fix
        let userStable = [];
        let list = [];
        let OpponateHand = [];
        let OpponateStable = [];
        let test = []
        if (other) {
            other = this.getDeckOrDiscard(other)//other can provide spsfication on what is visiable
        }
        for(let element of this.players) {
            if(element.getName() == name){
                for (let i of element.getHand()){
                    userHand.push(i.img)
                }
                for (let i of element.getStable()){
                    userStable.push(i.img)
                }
            } else {
                list.push(element.getName())
                test = []
                for (let i of element.getHand()){
                    test.push(i.img)
                }
                OpponateHand.push(test)
                test = []
                for (let i of element.getStable()){
                    test.push(i.img)
                }
                OpponateStable.push(test)

            }
        };
        let send = {
            PlayerHand : userHand,
            PlayerStable : userStable,
            OpponateList : list,
            OpponateHand : OpponateHand,
            OpponateStable : OpponateStable,
            DeckandDiscard : other
        }
        return send
    }
    getDeckOrDiscard(){

    }
}

function getRandomInt(max) { // merge with the drawFromDeck function
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {Board}

if (require.main === module){
    //--------in server.js--------
    let list = {'longString1':'host','longString2':'p1','longString3':'p2'};
    let game = new Board(list);
    game.setup();
    console.log(game.getState("host"))
}