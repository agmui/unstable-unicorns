/*useful links:
https://www.unicornsdatabase.com/
https://github.com/kedarv/unstable/blob/master/src/data.json
https://static.wikia.nocookie.net/unstableunicorns/images/1/18/336.png/revision/latest?cb=20190418002346*/
/*
extra rules when playing with 2 players
add neigh exseption
*/

deck = require('./data.json');

function foo(){
    console.log(1)
}

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
    action(action){
        switch(action){
            case 0:
                this.addCards;
                break;
            case 1:
                this.discard;
                break;
            case 2:
                this.play;
                break;
            case 3:
                this.destroy;
                break;
        }

    }
    addCards(cards) { // takes card object
        this.hand = this.hand.concat(cards)
        console.log(this.name+" added " + cards + " to hand")
    }
    discard(card){ // takes in index
        delete this.hand[card];
        console.log(this.name+" discared " + card)
    }
    play(card, player=false) { // could force a player to discard a card
        this.discard(card);
        if (player){
            this.stable.push(card);
        } else {
            player.play(card);
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
}

class Board {
    constructor(numOfPlayers){
        this.players = numOfPlayers // should be a list
        this.deck = []
        for (let i=0; i < deck.length; i++) {//improve
            this.deck.push(deck[i].quantity)
        }
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
        return final
    }
    setup(){
        this.players.forEach(p => {
            p.addCards(this.drawFromDeck(5)) ;
        } )
    }
}

function getRandomInt(max) { // merge with the drawFromDeck function
  return Math.floor(Math.random() * Math.floor(max));
}

function main(numOfPlayers, test) {
    let players = [] // fix, numOfPlayers is a dict
    for (var i in numOfPlayers) {
        players.push(new Player(numOfPlayers[i]))
    }
    let b = new Board(players);
    b.setup()
    let win = false
    let startingPlayer = getRandomInt(players.length)+1
    let p = players[startingPlayer];
    while (win == false) {
        console.log("--beginning of turn phase--") // may affect other players
        let action_ = -1;
        console.log(p)
        p.action(action_)
        console.log(test)

        console.log("--draw phase--")
        p.addCards(b.drawFromDeck())

        console.log("--action phase--")
        action_ = -1;
        p.action(action_)

        console.log("--end of turn phase--")
        if (p.winCondition){
            win = true
            break
        }
        if (p.checkHandNum()){
            let discard = -1
            players.discard(discard)
        }
        if (startingPlayer++ > numOfPlayers++){
            startingPlayer == 0
        } else {
            startingPlayer ++
        }
        p = players[startingPlayer]
    }
}
// ts
//main({"helpa3dv3":"host", "heeelapei":"p"}, true)

module.exports = {Player, Board, main}