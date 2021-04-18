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


function main(game:any, request:string, name:string, card, affectedCard:any, affectedPlayer:any, bypass=false) {
    let send, phase;
    let move: Array<any> = [];
    //request to see if more info needed
    console.log('card.js: card', card.name, 'request', request)
    if (request=='get') {
        //check if clicked on card location is correct
        //affectedCard means soemthing else when it is a get request
        if(affectedCard === name || affectedCard[0] === name|| affectedCard ==='bypass') {//fix

        } else {
            console.log('card.js: not users hand')
            return null
        }
        //all checks below could have vonabilaty if user were to change request on client side
        let test = game.move(name, card, 'Hand', 'Stable')//when initaly playing something
        if (test === false) return null//if class.js throws and error
        //tells client something moved
        move.push({name:name, card:card, from:[name,'Hand'], to:[name,'Stable']})
        switch(card.name){
            case "basic unicorn":
                game.rotatePhase()//not working
                break;
            case 'Controlled Destruction':
                send = {
                    //show: show,//(not used)sends a list with card objectes inside 
                    text: 'choose one card',
                    //maybe not nessisary because Player and card.js decides that
                    action: ['Stable','Discard'],
                    numOfCards: 1
                }
                break;
            case 'Unicorn Poison':// DESTROY a Unicorn
                send = {
                    text: 'choose one card',
                    action: ['Stable','Discard'],
                    numOfCards: 1
                }
                break;
        }
        return {send: send, move: move};
    } else if (request == 'reply'){
        //reply
        switch(card.name){
            case 'Controlled Destruction':
                console.log('affectedPlayer:',affectedPlayer)//ts
                //checks if it is valid imput first
                if (affectedPlayer[1]!=='Stable' || affectedCard.name === card.name || game.getPlayer(affectedPlayer[0]).getStableStr().includes(affectedCard.name) === false){
                    console.log('affectedCard is not valid input');
                    return 'error: not valid input';
                }
                console.log('card.js: recived affected Card', affectedCard.name); //ts
                console.log('activated controlled destruction');
                //after reciving reqest back for what to do
                game.move(affectedPlayer[0], affectedCard, [affectedPlayer[0],'Stable'], 'discard', false, true)
                //tells client something moved
                move.push({name:affectedPlayer[0], card:affectedCard, from:[affectedPlayer[0],'Stable'], to:'discard'})
                //checks if enough cards have been moved
                // after using the magic card
                game.move(name, card, 'Stable', 'discard')
                //tells client something moved
                move.push({name:name, card:card, from:[name,'Stable'], to:'discard'})
                phase = game.rotatePhase()//fix
                //tell client phase rotated
                console.log('card.js: rotated phase')//ts
                break;
        }
        return {move: move, phase:phase}
    }
}

module.exports = { main }