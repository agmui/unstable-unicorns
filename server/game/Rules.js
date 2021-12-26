const colors = require('colors');
const { forIn, forEach } = require('lodash');
const { couldStartTrivia } = require('typescript');
let deckData = require('../data.json');
const Board = require('./BoardClass.js');
const Player = require('./PlayerClass.js');

class rules {
    constructor(playerNames) {
        this.board = new Board.Board();//TODO
        this.players = []
        for (var i in playerNames) {
            this.players.push(new Player.Player(playerNames[i]))
        }
        this.log = []
        for(let i in deckData){
            for(let j=0; j<Number(deckData[i].quantity); j++){
                this.board.deck.push(new Board.Card(deckData[i].name, deckData[i].text, deckData[i].type, deckData[i].img, deckData[i].effect, deckData[i].action))//TODO
            }
        }
        this.turn = 0;
        this.phase = 0;
        this.sendPic = []
        this.bypass = []
    }
    setup() {
        let c = this.findCard('Glitter Bomb', 'Deck')
        //let c = this.findCard('Unicorn Poison', 'Deck')
        this.move('player1', c, 'Deck', 'Hand', false, true)
        c = this.findCard('Baby Unicorn (Pink)', 'Deck')
        this.move('player1', c, 'Deck', 'Stable', false, true)
        c = this.findCard('Baby Unicorn (Blue)', 'Deck')
        this.move('host', c, 'Deck', 'Stable', false, true)
        c = this.findCard('Baby Unicorn (Red)', 'Deck')
        this.move('host', c, 'Deck', 'Hand', false, true)
    };
    //name is a string and card need to be an object
    move(name, card, from, to, undo = false, bypass = false) { // params card CAN be a list or Card object
        if (name === this.bypass[this.bypass.length - 1]) this.bypass.pop()// checks bypass list for the most resent name to check if bypass is allowed
        else if (undo) { this.bypass.pop() }//if move call is an undo then can bypass (this could cause error if more than one bypass => undo)
        else if (name !== this.getTurn() && bypass == false) {//to prevent anyone from going out of turn
            console.log('class.js: not',name+'\'s turn');
            return false
        }
        else if (this.bypass.length > 0) return false// ensures that once inturupt is pressed noone else can go
        if (card == 'random') {
            card = (from == 'deck') ? this.drawFromDeck(1) : this.drawFromDiscard();
        }
        if (card instanceof Array == false) {// check if card param is a list
            card = [card]
        }
        let output = null
        console.log('class.js: ' + name + " moved " + card[0].name + " from " + from + " to " + to,)
        switch (from) {
            case "Deck":
                //checks if card is in domain
                if(this.board.removeCard(card, from)===null) return false
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
            case "Discard":
                //checks if card is in domain
                if(this.board.removeCard(card, from)===null) return false
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
                if(this.getPlayer(from[0]).removeCard(card, from[1])===null) return false
        }
        switch (to) {
            case "deck":
            case "discard":
                this.board.addCard(card, to)
                break
            case "Stable":
                //when Unicorn cards enter the stable
                if(card[0].effect==='enter'){
                    card[0].tap = false//needs to be tested (used for case of recursive cards)
                    output = {to:[name,to], card:card[0]}
                }
            case "Hand":
                this.getPlayer(name).addCard(card, to)
                break
            default://if opponate is returned
                this.getPlayer(to[0]).addCard(card, to[1])
                    
                //when Unicorn cards enter the stable
                if(to[1] === 'Stable' && card[0].effect ==='enter')output = {to: to, card:card[0]}//fix
        }
        for (let i of this.players) {// checks every move if someone wins, if true return username
            if (i.winCondition()) {
                console.log('Class.js: game over')
                return i;
            }
        }
        return output
        //if (undo == false) this.log.push([name, card, from, to, this.getPhase()]);
    }
    
    rotateTurn(){
        if(this.phase != 5){
            console.log("EROOR: not end of phase:")
            return false
        }
        this.turn++;
        this.phase = 0;
        this.log = []
        if(this.turn > this.players.length -1) this.turn = 0
        return this.getTurn() //TODO
    }

    rotatePhase() {//fix
        let phaseName;
        this.phase++
        if (this.phase >= 4 && this.getTurn(true).checkHandNum()) {// try to merge with bottom
            if (this.phase === 5) {//prevent player from going to next phase without discarding the right amount
                this.phase--
            }
            console.log('class.js:', this.getTurn(), 'has to many cards')
            return { numOfCards: this.getTurn(true).getHand().length - 7 }
        }
        switch (this.phase) {
            //beginning of turn phase check
            case 1:
                //TODO check for preturn start card effects
                console.log('beginning of turn phase')
                phaseName = 'Beginning Of Turn Phase'
                phaseName = this.rotatePhase()//fix
                break
            //draw phase
            case 2:
                console.log('game draws card for player *currently not implemented')
                phaseName = 'Draw Phase'
                phaseName = this.rotatePhase()//fix
                break
            //ask for action
            case 3:
                console.log('draw or play')
                phaseName = 'Action Phase'
                break
            //end of turn phase check
            case 4:
                //TODO check for end of turn card effects
                console.log('end of turn phase')
                phaseName = 'End of Turn Phase'
                phaseName = this.rotatePhase()//fix
                break
            case 5:
                phaseName = 'Press End Turn to continue'
                break

        }
        return phaseName;
    }

    getTurn(playerObject=false){
        return (playerObject)?  this.players[this.turn] : this.players[this.turn].getName()
    }

    getPhase(){
        return this.phase
    }

    getPlayer(name){
        for (let i of this.players){
            if (i.name===name) return i
        }
    }

    findCard(card, location, name=false){
        switch (location){
            case 'Hand':
            case 'Stable':
                let c = this.getPlayer(name).findCardInPlayer(card, location)
                if(c) return c //TODO
                return false
            case 'Deck':
            case 'Discard':
                return this.board.findCard(card, location)
        }
    }

    play(name, cardName, location, num){
        let card = this.findCard(cardName, location, name)

        //game checks
        if(this.getTurn() !== name){
            console.log('not',name,'turn')
            return false //check if its is player's turn
        }
        if(card === undefined){
            console.log('ERROR could not find card')
            return false
        }
        //checks if there is anything at the location

        let move = false
        switch(card.type|location){
            case 'Magic'|'Hand':
                break
            case 'Upgrade'|'Hand':
            case 'Downgrade'|'Hand':
                //if(this.move(name, card, "Hand", "Stable") === false) return false
                //move = true
                //break
            case 'Unicorn'|'Hand': //TODO make a way to reopen popup
                if(this.move(name, card, "Hand", "Stable") === false) return false
                move = true
                break
            case 'Magic'|'Stable':
                return false//should not be posible
            case 'Upgrade'|'Stable':
            case 'Downgrade'|'Stable':
                break
            case 'Unicorn'|'Stable':
                break
            default:
                //ban
        }

        console.log('PLAYED',cardName)
        return [card.action[num], move]
    }

    CardEffect(name, cardName, location, form){
        let card = this.findCard(cardName, location, name)
        let move = []
        if(card === false) return 

        //check if the form actions match the orignal card's actions
        let moreAction = false, validInput = false//signify if there are more acitons for a card
        for(let i=0; i < card.action.length; i++){
            if(card.action[i].type === form[0].type && card.action[i].amount === form.length){
                validInput = true
                if(card.action[i+1]){
                    moreAction = true;
                }
                break
            }
        }
        if(validInput === false) return [false, false, false]

        //TODO check if number of actions in form matches

        for(let affectedPlayer of form){
            let affectCard = this.findCard(affectedPlayer.cardName, affectedPlayer.location, affectedPlayer.name)
            switch(affectedPlayer.type){
                case 'discard':
                    /*D: Discard (Hand > discard)
                    params: (board) (name) (card)
                    [Glitter Bomb]*/
                    this.discard()//TODO
                    break
                case 'sacrifice':
                    /*
                    S: sacrifice (Stable > discard)
                    params: (board) (# of cards) (card type)
                    [Glitter Bomb]*/
                    this.sacrifice(affectedPlayer.name, affectCard)
                    move.push({
                        name: name,
                        cardName: affectCard.name,
                        from:'Stable',
                        to:'discard'
                    })
                    break
                case 'destroy':
                    /*
                    Destroy: Destroy (opp Stable > discard)
                    params:(# of cards) (card type)
                    [controlled destruction]
                    [unicorn poison]*/
                    this.destroy(affectedPlayer.name, affectCard)
                    move.push({
                        name: affectedPlayer.name,
                        cardName: affectCard.name,
                        from:'Stable',
                        to:'discard'
                    })
                    break
                case 'draw':
                    /*
                    Draw: (deck > Hand)
                    params: (board) (# of cards) (each player/ who)
                    [Wishing Well]*/
                    this.draw()//TODO
                    break
                case 'steal':
                    /*
                    Steal: (opponent Stable > Hand)
                    params: (board) (# of cards) (type) (where)
                    [Unicorn Trap]*/
                    this.steal()//TODO
                    break
                case 'bringBack':
                    /*
                    R: bringBack (Stable > Hand)
                    params: (board) (# of cards) (each player)
                    [Back Kick]*/
                    this.bringBack()//TODO
                    break
                case 'trade':
                    /*
                    T: trade (hand > opponent Hand OR Stable)
                    params: (board) (# of cards)  (where) (type) (each player) (all hand)
                    [Unfair Bargain]*/
                    this.trade()//TODO
                    break
                /*
                Chos: choose a card
                params: (board)  (where) (card type)
                [Nightmare's Conjuring]

                Ban:
                prams: (board) (card type) (action)
                [Broken Stable]

                Phase:
                Skip or adds some turn
                [Double Dutch]

                Look at player hand
                */
            }
        }
        return [validInput, moreAction, move]
    }

    

    sacrifice(name, card){
        this.move(name, card, "Stable", "discard", false, true)
    }

    destroy(name, card){
        this.move(name, card, "Stable", "discard", false, true)
    }

    draw(name, card){
        this.move(name, card, "Deck", "Hand", false, true)
    }

    steal(name, oppName, card){
        this.getPlayer(name).addCard(this.findCard(card, "Hand", oppName), "Hand")
        this.getPlayer(oppName).removeCard(card, "Hand")
    }

    bringBack(name, card){
        this.move(name, card, "Stable", "Hand", false, true)
    }

    trade(name, card){
        //TODO
    }

    choose(name, card){
        this.move(name, card, "Hand", "discard", false, true)
    }

    ban(){
        //TODO
    }

    printBoard(){
    console.log("====================")
    console.log("Phase:", this.getPhase(), "Turn:", this.getTurn())
    for (let i of this.players){
        console.log('\n--------------')
        console.log(i.getName())
        console.log('--------------\nHand:')
        for(let j of i.getHand()){
            console.log('   -',j.name)
        }
        console.log("Stable:")
        for(let j of i.getStable()){
            console.log('   -',j.name)
        }
    console.log("====================")
    }
    }
}

module.exports = { rules }