/*
Magic
| other
| no input
| input (user only)
    | destroy/ sacrifice
        |  destroy/ sacrifice only
        | sacrifce of destroy
    | discard first
    | draw
    | steal
    | other
input(user+others)


Upgrade/Downgrade
| other
| 1 phase
    | forced
    | optional move
        |discard
| all the time
    | baned
    | move
        |optional move
        | focred move
| game play
*/

function sacrifice(game, moveList, name:string|Object, card){//Stable > discard
    game.move(name, card, 'Stable', 'discard', false, true);
    moveList.push({name:name, card:card, from:[name,'Stable'], to:'discard'})
}
function destroy(game, moveList, name:string|Object, card){//opponate Stable > discard
    game.move(name, card, [name, 'Stable'], 'discard', false, true);
    moveList.push({name:name, card:card, from:[name,'Stable'], to:'discard'})
}
function discard(game, moveList, name:string|Object, card){//hand > discard
    game.move(name, card, 'Hand', 'discard', false, true);
    moveList.push({name:name, card:card, from:[name,'Hand'], to:'discard'})
}
function steal(game, moveList, name:string|Object, card){//opponate Stable > Stable
    game.move(name, card, [name, 'Stable'], 'Stable', false, true);
    moveList.push({name:name, card:card, from:[name,'Stable'], to:'Stable'})
}
function draw(game, moveList, name:string|Object, card){//deck > Hand
    game.move(name, card, 'deck', 'Hand', false, true);
    moveList.push({name:name, card:card, from:[name,'deck'], to:'Hand'})
}

function action(game, moveList, affectedObjects){
    for(let i of affectedObjects){
        switch(i.action){
            case 'sacrifice':
                i.card = game.findCard(i.card, [i.name, 'Stable'])
                sacrifice(game, moveList, i.name, i.card)
                break;
            case 'destroy':
                i.card = game.findCard(i.card, [i.name, 'Stable'])
                destroy(game, moveList, i.name, i.card)
                break;
            case 'discard':
                i.card = game.findCard(i.card, [i.name, 'Hand'])
                discard(game, moveList, i.name, i.card)
                break;
            case 'steal':
                i.card = game.findCard(i.card, [i.name, 'Stable'])
                steal(game, moveList, i.name, i.card)
                break;
            case 'draw':
                i.card = game.findCard(i.card, 'deck')
                draw(game, moveList, i.name, i.card)
                break;
        }
    }
}

function main(game:any, request:string, name:string, card, affectedObjects:any, bypass=false) {
    //console.log('ts',card)//ts
    let send, phase;
    let move: Array<any> = [];
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
        /*if (card.type !== 'Upgrade', 'Downgrade' && affectedCard[1] !== 'Stable'){//check applys for upgrade and downgrade cards
            let test = game.move(name, card, 'Hand', 'Stable')//when initaly playing something
            if (test === false) return null//if class.js throws and error
            //tells client something moved
            move.push({name:name, card:card, from:[name,'Hand'], to:[name,'Stable']})
        }*/
        if (affectedObjects[1] !== 'Stable'){//checks are ment for upgrade and downgrade cards
            let test = game.move(name, card, 'Hand', 'Stable')//when initaly playing something
            if (test === false) return null//if class.js throws and error
            //tells client something moved
            move.push({name:name, card:card, from:[name,'Hand'], to:[name,'Stable']})
        } else {
            if (card.type === 'Upgrade' || card.type === 'Downgrade') {//fix
            } else {
                console.log('error: card has no effect')
                return null
            }
        }
        switch(card.name){
            case "Basic Unicorn (Red)":
                phase = game.rotatePhase()
                break;
            //==========Magic==========
            case 'Controlled Destruction':
                phase = game.rotatePhase()
                send = {
                    text: card.text,
                    action: ['destroy']
                }
                break;
            case 'Unicorn Poison':// DESTROY a Unicorn
                phase = game.rotatePhase()
                send = {
                    text: card.text,
                    action: ['destroy']
                }
                break;
            //==========up,down grade==========
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
                        action: ['sacrifice', 'destroy']
                    }
                }
                else {
                    console.log('error: not beggining of turn phase')
                    return null
                }
                break;
        }
        return {send: send, move: move, phase: phase};
        //send is ment for the client.js gui, all the checks to see if recived vailid input is in reply (the code below)
    } else if (request == 'tapped'){
        switch(card.name){
            case 'special cards'://for cards the main function can't work with
                break;
            default:
                //add a check here to make sure there are the right num of affectedOvjects 
                //use json file to check num
                action(game, move, affectedObjects)
                card.tap = null
        }
        return {move: move, phase:phase}
    }
}

module.exports = { main }