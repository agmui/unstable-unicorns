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
function sacrifice(game, moveL, name, card) {
    game.move(name, card, 'Stable', 'discard', false, true);
    moveL.push({ name: name, card: card, from: [name, 'Stable'], to: 'discard' });
}
function destroy(game, moveL, name, card) {
    game.move(name, card, [name, 'Stable'], 'discard', false, true);
    moveL.push({ name: name, card: card, from: [name, 'Stable'], to: 'discard' });
}
function discard(game, moveL, name, card) {
    game.move(name, card, 'Hand', 'discard', false, true);
    moveL.push({ name: name, card: card, from: [name, 'Hand'], to: 'discard' });
}
function steal(game, moveL, name, card) {
    game.move(name, card, [name, 'Stable'], 'Stable', false, true);
    moveL.push({ name: name, card: card, from: [name, 'Stable'], to: 'Stable' });
}
function draw(game, moveL, name, card) {
    game.move(name, card, 'deck', 'Hand', false, true);
    moveL.push({ name: name, card: card, from: [name, 'deck'], to: 'Hand' });
}
let numOfCards = 0; //when multiple cards need to be inputed
function main(game, request, name, card, affectedCard, affectedPlayer, bypass = false) {
    let send, phase;
    let move = [];
    //request to see if more info needed
    console.log('card.js: card', card.name, 'request', request);
    if (request == 'get') {
        //check if clicked on card location is correct
        //affectedCard means soemthing else when it is a get request
        if (affectedCard === name || affectedCard[0] === name || affectedCard === 'bypass') { //fix
        }
        else {
            console.log('card.js: not users hand');
            return null;
        }
        //all checks below could have vonabilaty if user were to change request on client side
        /*if (card.type !== 'Upgrade', 'Downgrade' && affectedCard[1] !== 'Stable'){//check applys for upgrade and downgrade cards
            let test = game.move(name, card, 'Hand', 'Stable')//when initaly playing something
            if (test === false) return null//if class.js throws and error
            //tells client something moved
            move.push({name:name, card:card, from:[name,'Hand'], to:[name,'Stable']})
        }*/
        if (affectedCard[1] !== 'Stable') { //checks are ment for upgrade and downgrade cards
            let test = game.move(name, card, 'Hand', 'Stable'); //when initaly playing something
            if (test === false)
                return null; //if class.js throws and error
            //tells client something moved
            move.push({ name: name, card: card, from: [name, 'Hand'], to: [name, 'Stable'] });
        }
        else {
            if (card.type === 'Upgrade' || card.type === 'Downgrade') { //fix
            }
            else {
                console.log('error: card has no effect');
                return null;
            }
        }
        switch (card.name) {
            case "basic unicorn":
                phase = game.rotatePhase();
                break;
            //==========Magic==========
            case 'Controlled Destruction':
                send = {
                    text: 'choose one card',
                    numOfCards: 1
                };
                break;
            case 'Unicorn Poison': // DESTROY a Unicorn
                send = {
                    text: 'choose one card',
                    numOfCards: 1
                };
                break;
            //==========up,down grade==========
            case 'Glitter Bomb':
                //If this card is in your Stable at the beginning of your turn,
                //you may SACRIFICE a card, then DESTROY a card
                if (affectedCard[1] === 'Hand') { //inital play from hand to stable
                    phase = game.rotatePhase();
                }
                else if (game.getPhase() === 1) { //when card is tapped durring beggining of turn phase
                    send = {
                        text: 'choose a card to sacrifice then one to destroy',
                        numOfCards: 2
                    };
                }
                else {
                    console.log('error: not beggining of turn phase');
                    return null;
                }
                break;
        }
        return { send: send, move: move, phase: phase };
        //send is ment for the client.js gui, all the checks to see if recived vailid input is in reply (the code below)
    }
    else if (request == 'reply') {
        switch (card.name) {
            case 'Controlled Destruction': //fix cant trigger death effects
                //checks if it is valid imput first
                if (affectedPlayer[1] !== 'Stable'
                    || affectedCard.name === card.name //all cards might have condition so may need to move it up
                    || game.getPlayer(affectedPlayer[0]).getStableStr().includes(affectedCard.name) === false) {
                    console.log('affectedCard is not valid input');
                    return 'error: not valid input';
                }
                console.log('card.js: recived affected Card', affectedCard.name); //ts
                console.log('activated controlled destruction');
                //after reciving reqest back for what to do
                destroy(game, move, affectedPlayer[0], affectedCard);
                //tells client something moved
                //move.push({name:affectedPlayer[0], card:affectedCard, from:[affectedPlayer[0],'Stable'], to:'discard'})
                //checks if enough cards have been moved
                // after using the magic card
                game.move(name, card, 'Stable', 'discard');
                //tells client something moved
                move.push({ name: name, card: card, from: [name, 'Stable'], to: 'discard' });
                phase = game.rotatePhase();
                //tell client phase rotated
                break;
            case 'Unicorn Poison':
                if (affectedPlayer[1] !== 'Stable'
                    || affectedPlayer[0] === name //check if it form opponate stable
                    || affectedCard.name === card.name //all cards might have condition so may need to move it up
                    || affectedCard.type.includes('Unicorn') === false //can only destroy unicorn types
                    || game.getPlayer(affectedPlayer[0]).getStableStr().includes(affectedCard.name) === false) { //checks is affected player even has the card
                    console.log('affectedCard is not valid input');
                    return 'error: not valid input';
                }
                console.log('activated Unicorn Poison');
                destroy(game, move, affectedPlayer[0], affectedCard);
                //move.push({name:affectedPlayer[0], card:affectedCard, from:[affectedPlayer[0],'Stable'], to:'discard'})
                //checks if enough cards have been moved
                //add code
                game.move(name, card, 'Stable', 'discard');
                move.push({ name: name, card: card, from: [name, 'Stable'], to: 'discard' });
                phase = game.rotatePhase();
                break;
            case 'Glitter Bomb': //try to prevent soft locks
                if (numOfCards === 0) {
                    numOfCards++;
                    if (affectedPlayer[1] !== 'Stable'
                        || affectedPlayer[0] !== name //check if it is Player stable
                        || affectedCard.name === card.name //all cards might have condition so may need to move it up
                        || game.getPlayer(affectedPlayer[0]).getStableStr().includes(affectedCard.name) === false) {
                        console.log('affected card is not valid input');
                        return 'error: not valid input';
                    }
                    console.log('activated Glitter Bomb');
                    sacrifice(game, move, affectedPlayer[0], affectedCard);
                }
                else if (numOfCards === 1) {
                    if (affectedPlayer[1] !== 'Stable'
                        || affectedPlayer[0] === name //check if it is Opponate stable
                        || affectedCard.name === card.name //all cards might have condition so may need to move it up
                        || game.getPlayer(affectedPlayer[0]).getStableStr().includes(affectedCard.name) === false) {
                        console.log('affected card is not valid input');
                        return 'error: not valid input';
                    }
                    destroy(game, move, affectedPlayer[0], affectedCard);
                    move.push({ name: affectedPlayer[0], card: affectedCard, from: [affectedPlayer[0], 'Stable'], to: 'discard' });
                    numOfCards = 0;
                }
                break;
        }
        return { move: move, phase: phase, numOfCards: numOfCards };
    }
}
module.exports = { main };
