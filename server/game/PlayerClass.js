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
let deck = require('../data.json');
const { count } = require('console');
const { tap } = require('lodash');

class Player {
    constructor(username) {
        this.name = username;
        this.hand = [];
        this.stable = [];
    }
    addCard(card, where) { // card should be a list
        if (where == "Hand") {
            //this.hand = this.hand.concat(card); //fix
            this.hand.push(card[0])
        } else if (where == "Stable") {
            this.stable.push(card[0])
            //this.stable = this.stable.concat(card)
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
            console.log('Class.js:', card ,'card not in',this.name,'hand')
            return null
        } else if (location === 'Stable'){
            for (let i of this.getStable()){
                if (i.name === card) return (index) ? [i, this.stable.indexOf(i)] : i
            }
            console.log('Class.js:', card ,'card not in',this.name,'Stable')
            return null
        }
        else {//needs to be tested
            let output = this.findCardInPlayer({name:card}, 'Hand')
            return (output === null) ? this.findCardInPlayer({name:card,tap:tap}, 'Stable') : output
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

module.exports = { Player }