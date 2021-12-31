const colors = require('colors');
const e = require('express');
const { copyFileSync } = require('fs');
const { count } = require('console');
const { tap } = require('lodash');

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

class Board {
    constructor() {
        this.deck = []
        this.discard = []
        this.nursery = [] //TODO
    }
    //returns a list of card objects
    drawFromDeck(num = 1) { // fix if deck run out of cards
        let final = []
        for (let index = 0; index < num; index++) {
            do {
                var x = getRandomInt(this.deck.length);
            } while (this.deck[x] == 0);
            //this.deckValue[x]--//will be subtracted in move function
            final.push(new Card(this.deck[x].name, this.deck[x].text, this.deck[x].type, this.deck[x].img, this.deck[x].effect, this.deck[x].action))
        }
        return final
    }
    drawFromDiscard() {
        return [this.discard[getRandomInt(this.discard.length)]]
    }

    //parm card should be a list
    addCard(card, where) {//adds a card to deck or discard
        if (where == "deck") {
            for (let i of card){
                let c = this.findCard(i, 'deck', true)
                if (c === null) return null
                this.deck[c[1]] ++ 
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
                this.deck[c[1]]--//fix
            } else if (where=== 'discard'){
                this.discard.splice(c[1],1)//fix
            }
        }
    }
    //returns card object
    //card should be a Card obj or string
    findCard(card,location, index=false, tap = false) {
        let cardName = card
        if(card.name) cardName = card.name
        switch(location) {
            case undefined://if location param is not filled
                console.log("class.js: fill in location param")
                return null
            case "Deck":
                for(let i =0; i < this.deck.length; i ++){
                    if (this.deck[i].name === cardName) {
                        return (index) ? [this.deck[i], i] : this.deck[i];
                    }
                }
                console.log('Class.js: error card not found in deck')
                return null;
            case "Discard":
                for(let i of this.discard){
                    if (i.name === cardName) return (index) ? [i, this.discard.indexOf(i)] : i;
                }
                console.log('Class.js: error card not found in discard')
                return null;
            default://if array is returned
                if(card.tap)tap = card.tap
                let output = this.getPlayer(location[0]).findCardInPlayer({name:cardName,tap:tap}, location[1], false)
                if(output) return output
                console.log('WARNING'.black.bold.bgYellow,'could be error, trying diffrent tap')
                return this.getPlayer(location[0]).findCardInPlayer({name:cardName,tap:!tap}, location[1], false)
        }
        
    }
    getDeck(){
        return this.deck
    }
    getDiscard(){
        return this.discard
    }
}

function getRandomInt(max) { // merge with the drawFromDeck function
    return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {Card, Board }

//========exsample (destroy)========
/*function exsample(){
    let list = {'longString1':'host','longString2':'player1'};
    let game = new Board(list);


    let card = game.findCard('Unicorn Poison', 'deck')
    game.move('player1', card, "deck", ['host',"Hand"], false, true);
    card = game.findCard('The Great Narwhal', 'deck')
    game.move('player1', card, "deck", ['player1',"Stable"], false, true);

    game.getState('host',true)

    card = game.findCard('Unicorn Poison', ['host', 'Hand'])
    let affectedObjects = [{
        name: 'player1',
        card: 'The Great Narwhal'
    }]
    game.card(game, 'tapped', 'host', card, affectedObjects)

    game.getState('host',true)

}*/