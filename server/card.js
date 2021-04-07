function main(game, request, name, card, affectedCard, affectedPlayer) {
    let send, phase;
    let move = [];
    //request to see if more info needed
    console.log('card.js: ', card.name);
    if (request == 'get') {
        //check if clicked on card location is correct
        //affectedCard means soemthing else when it is a get request
        if (affectedCard[0] !== name) {
            console.log('card.js: not users hand');
            return null;
        } //all checks below could have vonabilaty if user were to change request on client side
        let test = game.move(name, card, 'Hand', 'Stable'); //when initaly playing something
        if (test === false)
            return null; //if class.js throws and error
        //tells client something moved
        move.push({ name: name, card: card, from: [name, 'Hand'], to: [name, 'Stable'] });
        switch (card.name) {
            case "basic unicorn":
                game.rotatePhase();
                break;
            case 'controlled destruction':
                //ping client.js for which card to move
                let show = [];
                for (let i of game.players) {
                    show.push(i.getStable());
                }
                send = {
                    show: show,
                    text: 'choose one card',
                    action: ['Stable', 'Discard'],
                    numOfCards: 1
                };
                break;
        }
        return { send: send, move: move };
    }
    else if (request == 'reply') {
        //reply
        switch (card.name) {
            case 'controlled destruction':
                console.log('affectedPlayer:', affectedPlayer); //ts
                //checks if it is valid imput first
                if (affectedPlayer[1] !== 'Stable' || game.getPlayer(affectedPlayer[0]).getStableStr().includes(affectedCard.name) === false) {
                    console.log('affectedCard is not valid input');
                    return 'error: not valid input';
                }
                console.log('card.js: recived affected Card', affectedCard.name); //ts
                console.log('activated controlled destruction');
                //after reciving reqest back for what to do
                game.move(affectedPlayer[0], affectedCard, [affectedPlayer[0], 'Stable'], 'discard', false, true);
                //tells client something moved
                move.push({ name: affectedPlayer[0], card: affectedCard, from: [affectedPlayer[0], 'Stable'], to: 'discard' });
                //checks if enough cards have been moved
                // after using the magic card
                game.move(name, card, 'Stable', 'discard');
                //tells client something moved
                move.push({ name: name, card: card, from: [name, 'Stable'], to: 'discard' });
                phase = game.rotatePhase();
                //tell client phase rotated
                console.log('card.js: rotated phase'); //ts
                break;
        }
        return { move: move, phase: phase };
    }
}
module.exports = { main };
