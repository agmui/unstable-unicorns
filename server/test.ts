//import * as _ from 'lodash';
const test = require('./PlayerClass');
let list, game
function setup() {
    console.log()
    list = {'longString1':'host','longString2':'a'};
    game = new test.Board(list);
    //game.setup();
    game.players.forEach(p => {
        game.move(p.getName(), game.drawFromDeck(1), "deck", [p.getName(), "Hand"], false, true);//ts
    });
    console.log("\n==setup over==");
}

//==check draw from deck==
setup()
console.log('check draw from deck\n')

let deck = game.deck
let cards = game.drawFromDeck()[0].name
game.move('host', game.drawFromDeck(), 'deck', 'Hand', false, true)
if(deck == game.deck) console.log('ERROR: drawFromDeck didn\'t change deck')

deck = game.deck
cards = game.drawFromDeck(2)
console.log(cards[0].name, cards[1].name)
game.move('host', cards, 'deck', 'Hand', false, true)
if(deck == game.deck) console.log('ERROR: drawFromDeck didn\'t change deck')
console.log('---------')
//==check discard==
setup()
console.log('check discard\n')
cards = game.drawFromDeck()
console.log('card name:',cards[0].name)
game.move('host', cards, 'deck', 'discard', false, true)
console.log('discard length:',game.discard.length)
cards = game.drawFromDiscard()
console.log('card name:',cards[0].name)
console.log('player hand before len:',game.players[0].getHand().length)
game.move('host', cards, 'discard', 'Hand', false, true)
if (game.discard.length==0) console.log('ERROR: did not draw from discard')
console.log('player hand after len:',game.players[0].getHand().length)
console.log('---------')
//==check setup==
setup()
console.log('check setup\n')
console.log('player hand len:',game.players[0].getHand().length,game.players[1].getHand().length)
console.log('---------')
//==check addCard==
setup()

console.log('---------')
//==check removeCard==
setup()

console.log('---------')
//==check move==
setup()

console.log('---------')
//==check undo==
setup()

console.log('---------')
//==check interupt==
setup()

console.log('---------')
//==check rotateTurn==
setup()

console.log('---------')
//==check rotatePhase==
setup()

console.log('---------')