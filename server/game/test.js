const rules = require('./rules.js');


function main(){
    let game = new rules.rules(["host", "player1"])
    game.setup()
    //game.printBoard()
    game.rotatePhase()
    //game.printBoard()
    let c = game.getPlayer("host").getHand()[0]
    game.play("host", c.name, "Hand")
    //game.printBoard()
    game.CardEffect("player1", c.name, "Stable", "some filled out form")
    console.log(game.getTurn(), game.turn)
    game.rotatePhase()
    game.printBoard()
    game.rotatePhase()
    game.rotateTurn();
    game.printBoard()
}

main()