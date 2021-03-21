/*useful links:
https://www.unicornsdatabase.com/
https://github.com/kedarv/unstable/blob/master/src/data.json
https://static.wikia.nocookie.net/unstableunicorns/images/1/18/336.png/revision/latest?cb=20190418002346*/
/*
extra rules when playing with 2 players
add neigh exseption
*/

deck = require('./data.json');

class Card {
    constructor(name, text, type) {
       this.name = name;
       this.text = text;
       this.type = type; 
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
    destroy(card) { // removes card from stable
        delete this.stable[card];
        console.log(this.name + " got " + card + " removed")
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
        return this.hand;
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
            final.push(new Card(deck[x].name, deck[x].text, deck[x].date))
        }
        //this.updateGui(change)
        return final
    }
    setup(){
        this.players.forEach(p => {
            p.addCards(this.drawFromDeck(5)) ;
        } )
    }
    action(action, card = -1, toWho = false){
        console.log('act:',action)
        if (this.phase==5){
            if (action == 5){
                this.phase = 1
                return
            } else {
                return
            }
        }
        switch(action){
            case 0://draw
                this.players[this.turn].addCards(game.drawFromDeck(1))
                break
            case 1://discard
                this.players[this.turn].discard(card)
                break
            case 2://play
                this.players[this.turn].play(card, toWho)
                break
            case 3://destroy
                this.players[this.turn].destroy(card)
                break
            case 4://pass
                break
        }
        this.log.push([action, card, toWho]);
        this.phase++
    }
    // looks at the most recent action in log and undoes it
    undo(){
        let action = this.log[this.log.length-1][0]
        let card = this.log[this.log.length-1][1]
        let toWho = this.log[this.log.length-1][2]
        console.log("previos action was: "+action)
        switch(action){
            case 0://draw
                this.players[this.turn].UaddCards(card)
                break
            case 1://discard
                this.players[this.turn].Udiscard(card)
                break
            case 2://play
                this.players[this.turn].Uplay(card, toWho)
                break
            case 3://destroy
                this.players[this.turn].Udestroy(card)
                break
            case 4://pass
                break
        }
        this.log.pop()
        this.phase--;
    }
    getWhosTurn(){ //NOTE not a accesser method
        //rotates to next player's turn
        this.turn++
        if (this.turn>this.players.length-1){
            this.turn=0
        }
        return this.players[this.turn].getName();
    }
    getTurn(){
        return this.players[this.turn].getName();
    }
    getPhase(){
        return this.phase;
    }
    getPlayersHand(){
        return this.players[this.turn].getHand();
    }
    getPlayersStable(){
        return this.players[this.turn].getStable();
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
    // have the game return what everyone's hands look like after every action so gui can update
    // note just running the actions automadicly updates the gui so no need to run the update gui function
    console.log(game.getWhosTurn())

    let action = -1;
    let card = 0;
    //-----beginning of turn phase---
    action = 1; // could be 0-3
    card = 0;
    game.action(action, card);
    // have the game return what everyone's hands look like after every action so gui can update
    //-----draw phase---
    action = 0;
    game.action(action);
    //-----action phase---
    action = 2;// could be 0-3
    card = 0;
    game.action(action, card);
    //-----end of turn phase---
    action = 1; // could be 0-3
    card = 0;
    game.action(action, card);
    console.log(game.getWhosTurn()); // roatates to next person
    //repeat
}