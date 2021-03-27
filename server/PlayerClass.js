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
    addCard(card, where) { // card should be a list
        if (where == "Hand"){
            this.hand = this.hand.concat(card) ;
        } else if (where == "Stable") {
            this.stable = this.stable.concat(card)
        }
    }
    removeCard(card, where) {
        if (where == "Hand"){
            this.hand = this.hand.filter(n => !card.includes(n))
        } else if (where == "Stable"){
            this.stable = this.stable.filter(n => !card.includes(n))
        }
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
        this.discard = []
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
        this.players.forEach(p => {
            this.move(p.getName(), this.drawFromDeck(1), "deck", [p.getName(),"Hand"]);
        })
    }
    //parm card should be a list
    addCard(card, where){//adds a card to deck or discard
       if (where == "deck") {
           this.deck = this.deck.concat(card);
       } else if (where == "discard") {
           this.discard = this.discard.concat(card);
       }
    }
    //parm card should be a list
    removeCard(card, where){// removes a card from deck or discard
       if (where == "deck") {
            this.deck = this.deck.filter(n => !card.includes(n))
       } else if (where == "discard") {
            this.discard = this.discard.filter(n => !card.includes(n))
       }
    }
    //name, from, and to are all Strings exsept for when player is passed
    //when player is passed it is a list with [name, Hand/Stable]
    move(name, card, from, to){ // params card is a list with card objects
        console.log('class.js: '+name + " moved " + card[0]+ " from " + from+ " to " +to,to[0].name, to[1])
        let index
        switch (from) {
            case "deck":
                this.removeCard(card, from)
                break
            case "discard":
                this.removeCard(card, from)
                break
            case "Hand":
            case "Stable":
                for (let i of this.players) {
                    if (i.getName()==name){
                        i.removeCard(card, from)
                        break
                    }
                }
                break
            default://if opponate is returned
                index = this.players.findIndex((player) => player.getName()==from[0])
                this.players[index].removeCard(card, from[1])
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
                    if (i.getName()==name){
                        i.addCard(card, to)
                        break
                    }
                }
                break
            default://if opponate is returned
                index = this.players.findIndex((player) => player.getName()==to[0])
                this.players[index].addCard(card, to[1])
        }
        this.log.push([name, card, from, to]);
    }
    /*// inputs card string returns card object
    findCard(card, location){
        this.getDeckOrDiscard()
    }*/
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
                    userHand.push(i)
                }
                for (let i of element.getStable()){
                    userStable.push(i)
                }
            } else {
                list.push(element.getName())
                test = []
                for (let i of element.getHand()){
                    test.push(i)
                }
                OpponateHand.push(test)
                test = []
                for (let i of element.getStable()){
                    test.push(i)
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
    getDeckOrDiscard(){// still in work in progress
        //console.log(this.deck)
        console.log("discard: ")
        for (let i of this.discard){
            console.log(i.name)
        }
        return this.discard
    }
}

function getRandomInt(max) { // merge with the drawFromDeck function
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {Board}

if (require.main === module){
    let list = {'longString1':'host','longString2':'p1','longString3':'p2'};
    let game = new Board(list);
    game.setup();
    console.log("==setup over==");
    console.log(game.getState("host"))
    game.move("host", [game.players[0].getHand()[0]], "Hand", "Stable")
    console.log(game.getState("host"))
    game.move("host", [game.players[0].getStable()[0]], "Stable", "Hand")
    console.log(game.getState("host"))
    game.move("host", [game.players[0].getHand()[0]], "Hand", [game.players[1].getName(),"Hand"])
    console.log(game.getState("host"))
    console.log(game.players[0])
}
