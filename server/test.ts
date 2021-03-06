//import * as _ from 'lodash';
const test = require('./PlayerClass');
let deck = require('./data.json');
const colors = require('colors');
let list, game
function setup() {
    console.log()
    list = {'longString1':'host','longString2':'a','longString3':'b'};
    game = new test.Board(list);
    //game.setup();
    game.players.forEach(p => {
        game.move(p.getName(), game.drawFromDeck(), "deck", [p.getName(), "Hand"], false, true);//ts
    });
    console.log("\n==setup over==".bgGreen.bold);
}

//==check draw from deck==
setup()
console.log('check draw from deck'.blue.bold,'\n')

let deckValue = game.deckValue+[]
game.move('host', game.drawFromDeck(), 'deck', 'Hand', false, true)
if(deckValue == game.deck) console.log('ERROR: drawFromDeck didn\'t change deck'.bgRed)

deckValue = game.deckValue+[]
let cards = game.drawFromDeck(2)
console.log(cards[0].name, cards[1].name)
game.move('host', cards, 'deck', 'Hand', false, true)
if(deckValue == game.deck) console.log('ERROR: drawFromDeck didn\'t change deck'.bgRed)
console.log('---------')
//==check discard==
setup()
console.log('check discard'.blue.bold,'\n')
cards = game.drawFromDeck()
console.log('card name:',cards[0].name)
game.move('host', cards, 'deck', 'discard', false, true)
console.log('discard length:',game.discard.length)
cards = game.drawFromDiscard()
console.log('card name:',cards[0].name)
console.log('player hand before len:',game.players[0].getHand().length)
game.move('host', cards, 'discard', 'Hand', false, true)
if (game.discard.length!=0) console.log('ERROR: did not draw from discard'.bgRed)
console.log('player hand after len:',game.players[0].getHand().length, 'discard:', game.discard)
console.log('---------')
//==check setup==
setup()
console.log('check setup'.blue.bold,'\n')
console.log('player hand len:',game.players[0].getHand().length,game.players[1].getHand().length)
if (game.players[0].getHand().length==0 || game.players[1].getHand().length == 0) console.log('ERROR: set up not drawing for a player'.bgRed)
console.log('---------')
//==check addCard==
setup()
console.log('check addCard'.blue.bold,'\n')
cards = game.players[0].getHand()
console.log(cards[0].name);
deckValue = game.deckValue+[]
game.addCard(cards, 'deck')
if(deckValue === game.deckValue) console.log('ERROR: addCard did not work for deck'.bgRed)
game.addCard(cards, 'discard')
if(game.discard.length==0)console.log('ERROR: addCard did not work for discard'.bgRed)
console.log('---------')
//==check removeCard==
setup()
console.log('check removeCard'.blue.bold,'\n')
cards = game.players[0].getHand()
console.log(cards[0].name);
deckValue = game.deckValue.length
game.addCard(cards, 'deck')
game.removeCard(cards, 'deck')
if(deckValue != game.deckValue.length) console.log('ERROR: removeCard did not work for deck'.bgRed)
game.addCard(cards, 'discard')
game.removeCard(cards, 'discard')
if(game.discard.length)console.log('ERROR: removeCard did not work for discard'.bgRed)
console.log('---------')
//==check move==
setup()
console.log('check move'.blue.bold,'\n')
//from: deck to: discard
//from: deck to: player
//from: deck to: opponate

//from: discard to: deck
//from: discard to: player
//from: discard to: opponate

//from: player to: deck
//from: player to: discard
//from: player to: opponate

//from: opponate to: deck
//from: opponate to: discard
//from: opponate to: player

//undo param
//bypass param
console.log('---------')
//==check undo==
setup()
console.log('check undo\n')
//normal undo
//reached end of undo
//undo phases only
//interupt => opponate move => undo
//not alowed undos ex: some interupts

console.log('---------')
//==check interupt==
setup()
console.log('check interupt'.blue.bold,'\n')
game.interupt('a')
console.log('bypass list:',game.bypass)
game.move('host', game.players[0].getHand(), 'Hand', 'discard')
console.log('discard:',game.discard)
if (game.discard.length) console.log('ERROR: interupt let host go before interupt'.bgRed)
game.move('a', game.players[1].getHand(), ['a','Hand'], 'discard')
console.log('discard:',game.discard)
if (game.discard.length==0) console.log('ERROR: interupt did not let opponate go'.bgRed)

//chain interupts
console.log('---------')
//==check rotateTurn==
setup()
console.log('check rotateTurn\n')
//wrong phase
game.rotateTurn()
if (game.turn>1) console.log('ERROR: roatateTurn changed turn on phase <5'.bgRed)
//rotat turn
for (let i=0;i<4;i++){
    game.rotatePhase()
}
game.rotateTurn()
console.log('turn:',game.turn)
if (game.turn<1) console.log('ERROR: roatateTurn does not work'.bgRed)
console.log('---------')
//==check rotatePhase==
setup()
console.log('check rotatePhase\n')
game.rotatePhase()
if (game.phase<1) console.log('ERROR: rotatePhase not working'.bgRed)
//interupt not finished => rotate phase
console.log('---------')