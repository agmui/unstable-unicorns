/*useful links:
https://www.unicornsdatabase.com/
https://github.com/kedarv/unstable/blob/master/src/data.json
https://static.wikia.nocookie.net/unstableunicorns/images/1/18/336.png/revision/latest?cb=20190418002346*/
/*
extra rules when playing with 2 players
*/

deck = require('C:\\Users\\antho\\Documents\\GitHub\\unstable-unicorns\\data.json');

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
    addCards(cards) { // takes card object
        this.hand.concat(cards)
    }
    discard(card){ // takes in index
        delete this.hand[card];
    }
    play(card, player=false) {
        this.discard(card);
        if (player){
            this.stable.push(card);
        } else {
            player.play(card);
        }
    }
    destroy(card) { // removes card from stable
        delete this.stable[card];
    }
    checkHandNum(){
        return this.hand.length>7;
    }
}

class Board {
    constructor(Players){
        this.players = Players // should be a list
        this.deck = []
        for (let i=0; i < deck.length; i++) {//improve
            this.deck.push(deck[i].quantity)
        }
    }
    drawFromDeck(num=1){ // fix if deck run out of cards
        for (let index = 0; index < num; index++) {
            do{
            var x = getRandomInt(deck.length);
            } while(this.deck[x]!=0);
            this.deck[x] --
            return [new Card(deck[x].name, deck[x].text, deck[x].date)]
        }
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

let test = [new Player("p1"), new Player("p2"), new Player("p3")];
let b = new Board(test);
b.setup()

console.log(test[0].hand)