/*
D: Discard 

(# of cards) (card type) 

[Glitter Bomb] 

 

S: sacrifice 

(# of cards) (card type) 

[Glitter Bomb] 

 

Destroy: Destroy 

(# of cards) (card type) 

[controlled destruction] 

[unicorn poison] 

 

Draw: 

(# of cards) (each player/ who) 

[Wishing Well] 

 

Steal: 

(# of cards) (type) (where) 

[Unicorn Trap] 

 

R: return (stable > Hand) 

(# of cards) (each player) 

[Back Kick] 

 

T: trade 

(# of cards)  (where) (type) (each player) (all hand) 

[Unfair Bargain] 

 

Chos: choose a card 

Params: (where) (card type) 

[Nightmare's Conjuring] 

 

Ban: 

(card type) (action) 

[Broken Stable] 

 

Phase: 

Skip or adds some turn 

[Double Dutch] 

 

Look at player hand 
*/
//glitter bomb
function sacrifice(game, moveList, name, card){//Stable > discard
    moveList.push({name:name, card:card, from:[name,'Stable'], to:'discard'})
    return game.move(name, card, 'Stable', 'discard', false, true);
}
//unicorn poison
function destroy(game, moveList, name, card){//opponate Stable > discard
    moveList.push({name:name, card:card, from:[name,'Stable'], to:'discard'})
    return game.move(name, card, [name, 'Stable'], 'discard', false, true);
}
//glitter bomb
function discard(game, moveList, name, card){//hand > discard
    moveList.push({name:name, card:card, from:[name,'Hand'], to:'discard'})
    return game.move(name, card, 'Hand', 'discard', false, true);
}
//unicorn trap
function steal(game, moveList, name, username, card){//opponate Stable > Stable
    moveList.push({name:name, card:card, from:[name,'Stable'], to:[username, 'Stable']})
    return game.move(name, card, [name, 'Stable'], 'Stable', false, true);
}
//wishing well
function draw(game, moveList, name, username, card){//deck > Hand
    moveList.push({name:name, card:card, from:[name,'deck'], to:[username, 'Hand']})
    return game.move(name, card, 'deck', 'Hand', false, true);
}
//back kick
function bringBack(game, moveList, name, card){//Stable > Hand
    moveList.push({name:name, card:card, from:[name,'Stable'], to:[name, 'Hand']})
    return game.move(name, card, 'Stable', 'Hand', false, true);
}
//unfair bargain
function trade(game, moveList, affObj, where){//Hand > oppHand OR Stable > oppStable
    moveList.push({name:affObj.player.name, card:affObj.player.card, from:[affObj.player.name,where], to:[affObj.opp.name, where]})
    moveList.push({name:affObj.opp.name, card:affObj.opp.card, from:[affObj.opp.name,where], to:[affObj.player.name, where]})
    let test = game.move(affObj.player.name, affObj.player.card, where, [affObj.opp.name, where], false, true)
    game.move(affObj.opp.name, affObj.opp.card, where, [affObj.player.name, where], false, true)
    return test//fix
}

//specific card type check
function checkType(affectedCard, mainCard){
    if(mainCard.cardType.length != 0){//check if it works
        if(!mainCard.cardType.includes(affectedCard.type)){
            console.log('card.js: error not correct card type')
            return null
        }
        return true
    }
}

function action(game, moveList, username, mainCard, affectedObj){
    for(let i=0; i < affectedObj.length; i++ ){
        switch(mainCard[i].type){
            case 'sacrifice':
                affectedObj[i].card = game.findCard(affectedObj[i].card, [affectedObj[i].name, 'Stable'])
                if (checkType(affectedObj[i].card, mainCard[i]) === null) return null
                return sacrifice(game, moveList, affectedObj[i].name, affectedObj[i].card)
            case 'destroy':
                affectedObj[i].card = game.findCard(affectedObj[i].card, [affectedObj[i].name, 'Stable'])
                if (checkType(affectedObj[i].card, mainCard[i]) === null) return null
                return destroy(game, moveList, affectedObj[i].name, affectedObj[i].card)
            case 'discard':
                affectedObj[i].card = game.findCard(affectedObj[i].card, [affectedObj[i].name, 'Hand'])
                if (checkType(affectedObj[i].card, mainCard[i]) === null) return null
                return discard(game, moveList, affectedObj[i].name, affectedObj[i].card)
            case 'steal':
                affectedObj[i].card = game.findCard(affectedObj[i].card, [affectedObj[i].name, 'Stable'])
                if (checkType(affectedObj[i].card, mainCard[i]) === null) return null
                return steal(game, moveList, affectedObj[i].name, username, affectedObj[i].card)
            case 'draw':
                affectedObj[i].card = game.findCard(affectedObj[i].card, 'deck')
                if (checkType(affectedObj[i].card, mainCard[i]) === null) return null
                return draw(game, moveList, affectedObj[i].name, username, affectedObj[i].card)
            case 'bringBack':
                affectedObj[i].card = game.findCard(affectedObj[i].card, [affectedObj[i].name,'Stable'])
                if (checkType(affectedObj[i].card, mainCard[i]) === null) return null
                return bringBack(game, moveList, affectedObj[i].name, affectedObj[i].card)
            case 'trade':
                affectedObj[i].player.card = game.findCard(affectedObj[i].player.card, [affectedObj[i].player.name, mainCard[i].location])
                affectedObj[i].opp.card = game.findCard(affectedObj[i].opp.card, [affectedObj[i].opp.name, mainCard[i].location])
                if (checkType(affectedObj[i].opp.card, mainCard[i]) === null) return null
                return trade(game, moveList, affectedObj[i], mainCard[i].location)
        }
    }
}

function main(game, request, name, card, affectedObjects, bypass=false) {
    let send, phase, output;
    let move = [];
    console.log('card.js: card', card.name, 'request', request)
    if (request=='play') {
        //check if clicked on card location is correct
        //affectedCard means soemthing else when it is a get request
        if(affectedObjects === name || affectedObjects[0] === name|| affectedObjects ==='bypass') {//fix

        } else {
            console.log('card.js: not users hand')
            return null
        }
        //all checks below could have vonabilaty if user were to change request on client side
        if (affectedObjects[1] !== 'Stable'){//checks are ment for upgrade and downgrade cards
            if(card.type !== 'Magic'){
                let test = game.move(name, card, 'Hand', 'Stable')//when initaly playing something
                if (test === false) return null//if class.js throws and error
                if(test instanceof Array)output = test

                //tells client something moved
                move.push({name:name, card:card, from:[name,'Hand'], to:[name,'Stable']})
            }
        } else {
            if (!(card.type === 'Upgrade' || card.type === 'Downgrade')) {
                console.log('error: card has no effect')
                return null
            }
        }
        switch(card.name){
            case 'Glitter Bomb':
                //If this card is in your Stable at the beginning of your turn,
                //you may SACRIFICE a card, then DESTROY a card
                if(affectedObjects[1]==='Hand'){//inital play from hand to stable
                    phase = game.rotatePhase()
                }else if (game.getPhase()===1){//when card is tapped durring beggining of turn phase
                    //switch mode to tapped
                    card.tap = true
                    send = {
                        text: card.text,
                        action: card.action
                    }
                }
                else {
                    console.log('error: not beggining of turn phase')
                    return null
                }
                break;
            default:
                phase = game.rotatePhase()
                if(card.action.length){
                    send = {
                        text: card.text,
                        action: card.action,
                    }
                }
        }
        return {send: send, move: move, phase: phase, startCondition: output};
        //send is ment for the client.js gui, all the checks to see if recived vailid input is in reply (the code below)
    } else if (request == 'tapped'){
        switch(card.name){
            case 'special cards'://for cards the main function can't work with
                break;
            default:
                //add a check here to make sure there are the right num of affectedOvjects 
                //use json file to check num
                let add= []
                for(let i of card.action){
                    for(let j=1; j < i.amount; j++){
                        i.amount = 1
                        add = add.concat(i)
                    }
                }
                for(let i of add){
                    card.action.splice(card.action.indexOf(i),0, i)
                }

                if(card.action.length !== affectedObjects.length) {
                    console.log('card.js: error did not fill form completely')
                    return null
                }
                
                output = action(game, move, name, card.action, affectedObjects)
                if(card.type === 'Magic') {//fix
                    affectedObjects = [{name:name, card:card.name}]
                    action(game, move, name, [{type:"discard", cardType:[]}], affectedObjects)
                }
                card.tap = null
        }
        return {move: move, phase:phase, startCondition: output}
    }
}

module.exports =  {main }
