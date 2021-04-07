function main(game:any, request:any, name:string, card, affectedCard:any) {
    let send;
    let move: Array<any> = [];
    //request to see if more info needed
    console.log('card.js: ', card.name)
    if (request=='get') {
        game.move(name, card, 'Hand', 'Stable')//when initaly playing something
        //tells client something moved
        move.push({name:name, card:card, from:[name,'Hand'], to:[name,'Stable']})
        switch(card.name){
            case "basic unicorn":
                game.rotatePhase()
                break;
            case 'controlled destruction':
                //ping client.js for which card to move
                let show = []
                for(let i of game.players){
                    show.push(i.getStable())
                }
                send = {
                    show: show,//sends a list with card objectes inside
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
            case 'controlled destruction':
                //checks if it is valid imput first
                if (game.getPlayer(affectedCard[1]).getStableStr().includes(affectedCard[0].name) === false){
                    console.log('affectedCard is not valid input');
                    return;
                }
                console.log('card.js: recived affected Card', affectedCard[0].name); //ts
                console.log('activated controlled destruction');
                //after reciving reqest back for what to do
                game.move(game.getPlayer(affectedCard[1]).name, affectedCard[0], 'Stable', 'discard', false, true)
                //tells client something moved
                move.push({name:game.getPlayer(affectedCard[1]).name, card:affectedCard[0], from:[name,'Stable'], to:'discard'})
                //checks if enough cards have been moved
                //otherwise rotate
                game.rotatePhase()
                console.log('card.js: rotated phase')//ts
                // after using the magic card
                game.move(name, card, 'Stable', 'discard')
                //tells client something moved
                move.push({name:name, card:card, from:[name,'Stable'], to:'discard'})
                break;
        }
        return {move: move}
    }
}

module.exports = { main }