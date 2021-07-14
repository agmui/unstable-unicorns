// try to make sure multiple players dont take the same username
var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var usernameInputValue = document.getElementById('username_input')
var username = '';
let allCards = {};//not used
gameOver = false;


form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) { // make it so they cant use chat before they enter a username
    socket.emit('chat message', username + ": " + input.value);
    input.value = '';
  }
  if (usernameInputValue.value) {
    socket.emit('username input', usernameInputValue.value);
    username = usernameInputValue.value
    usernameInputValue.value = '';
    document.getElementById("username").remove();
    usernameInputValue.remove();
    document.getElementById("b").remove();
    document.getElementById("displayName").innerHTML = "Player: " + username
  }
});

socket.on('chat message', function (msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("num of players", function (playerList) {
  document.getElementById("ready").remove();
  document.getElementById('phaseUI').innerHTML = "Beginning Of Turn Phase";
  let item, opponate, hand, stable, name;// fix
  for (var element in playerList) {
    name = playerList[element]
    if (username != name) {
      // displaying player names gui
      item = document.createElement('li');
      item.textContent = name;
      document.getElementById("score board").appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
      // creating opponate gui
      opponate = document.createElement('div');
      opponate.id = name;
      opponate.innerHTML = name + "'s cards: ";
      document.getElementById("board").append(opponate)

      hand = document.createElement('div');
      hand.id = name + 'Hand'
      hand.innerHTML = 'Hand:'
      opponate.append(hand)

      stable = document.createElement('div');
      stable.id = name + 'Stable'
      stable.innerHTML = 'Stable:'
      opponate.append(stable)

      //fixing player's hands and stable id's
      document.getElementById('Player').id = username
      document.getElementById('Hand').id = username+'Hand'
      document.getElementById('Stable').id = username+'Stable'

      //creating interupt gui
      opponate = document.createElement("button")
      opponate.id = name
      opponate.onclick = function () { interupt(name) }
      opponate.innerHTML = name
      document.getElementById('interupt').append(opponate)
      document.getElementById('interupt').style.display = 'none'
    }
  }
});

//shows all action btn
socket.on("turn start", function (name) {
  document.getElementById('whosTurn').innerHTML = 'Turn: ' + name
  if (username == name) {
    elem = document.getElementById('btn');
    elem.style.display = "block";
  } else {
    elem = document.getElementById('btn');
    elem.style.display = "none";
  }
})

socket.on("phase", function (phase, name) {
  let text;
  switch (phase) {
    case 1:
      text = "Beginning Of Turn Phase"
      break
    case 2:
      text = "Draw Phase"
      break
    case 3:
      text = "Action Phase"
      break
    case 4:
      text = "End of Turn Phase"
      break
    case 5:
      text = "Press End Turn to continue"
      if (name == username) {
        document.getElementById('endPhase').style.display = "none";
        document.getElementById('end turn').style.display = "block";
      }
      break
    default://if player has >7 cards in hand
      text = "End of Turn Phase"
      console.log('to many cards remove', phase.numOfCards, 'num of cards')
  }
  console.log('phase: ' + text)
  document.getElementById('phaseUI').innerHTML = text;
});
// when another player moves a card recives action here
socket.on("move", function (name, card, from, to, winner) {
  console.log("reciving from server:" + name + ' moved ' + card.name + ' from ' + from + ' to ' + to)
  updateBoard(card, from, to)
  if (winner) {//game over sequence
    console.log('winner:', winner);
    document.getElementById('btn').style.display = 'none'
    gameOver = true;//blocks furthure actions
    //add game over animation and popup here
  }
});

// recives ping form server when someone udoes a move
socket.on('undo', function (action) {
  if (action == false) {
    return;
  }
  if (action == 'end') {
    console.log('out of undo')
    return
  }
  //check's whos turn it is and makes them do the move fuction
  if (document.getElementById('whosTurn').innerHTML == 'Turn: ' + username) {// fix way of getting who's turn
    //move(username, action.card, action.to, action.from, true);
  }
})

//reciving random card from deck or discard
socket.on('random card', function (card) {
  console.log(card)
});

//reciving out of cards msg
socket.on('no cards', function (name) {
  if (name === username) {
    document.getElementById('display').style.display = 'none'
    document.getElementsByClassName('modal-body').innerHTML = 'no cards'//not working
    console.log('no cards')
  }
});

// =====================reciving imgs=================
socket.on("image", function (info, where, cardObject) {
  if (info.image) {
    let img = document.createElement("IMG")

    img.onclick = function() {
      let who =  img.parentElement.parentElement.id
      let location = img.parentElement.id.slice(who.length)
      socket.emit('play', username, cardObject, [who,location]);

      //====popup stuff===
      //checks if btn is in hand and if its player's turn
      let turn = document.getElementById('whosTurn').innerHTML.slice(6)//remove all slice
      if( !(turn === username && location === 'Hand' &&  who === username) || cardObject.type === 'Magic'){//optimize
        document.getElementById('text').innerHTML = cardObject.text
        const modal = document.querySelector(img.dataset.modalTarget)
        openModal(modal)
      } 
      //=================
    }

    img.src = 'data:image/jpeg;base64,' + info.buffer;
    allCards[cardObject.name] = cardObject;
    img.id = cardObject.name
    img.name = cardObject.name 
    img.setAttribute("data-modal-target", "#modal")
    img.setAttribute("width", 150)
    img.setAttribute("height", 200)
    if (where[1] === 'display' && where[0] === username) {//reciving deck/discard img to go to display
      document.getElementById('display').appendChild(img)
    } else if (where[0] == username) {
      document.getElementById(where[0] + where[1]).appendChild(img)//fix
    } else if (where[1] != 'display') {
      document.getElementById(where[0] + where[1]).appendChild(img)
    }
  }
});

//fix problem when option above chooses a card the bottem option cant choose the same card
let formObject = {}
socket.on('recivedTapped', function(name, card, output, location) {
  if (username !== name ) return
  //open gui and fill form ========
  let affectedObjects = []//optimize
  let removeIndex, opponates, actionElement, img, playerNames

  document.getElementById('text').innerHTML = output.send.text
  document.getElementById('confirm').style.display = 'block'

  //formats the cards that show up on the popup
  const cardAction = (action, img, player, actionElement) => {//optimize
    //remove activated card from popup
    removeIndex = Array.from(img).findIndex((img) => img.name === card.name && player === name)
    for (let i = 1; i < img.length; i++) {//starts on 1 cause node list has text as first elemt
      if(i === removeIndex)continue
      if(action.cardType.length === 0 || action.cardType.includes(allCards[img[i].name].type)){//check if card type is specified
        let cloneImg = img[i].cloneNode(true)
        cloneImg.className = 'unselect'
        cloneImg.onclick = () => {//optimize
          if(cloneImg.className === 'highlight') {
            cloneImg.className = 'unselect'
            affectedObjects.splice(affectedObjects.indexOf(cloneImg.name), 1)
            formObject.affectedObjects = affectedObjects
            return
          }
          let imgInPopup = actionElement.getElementsByClassName('highlight')
          if(action.amount === imgInPopup.length) {
            imgInPopup[imgInPopup.length-1].className = 'unselect'
            affectedObjects.splice(affectedObjects.length-1, 1)
            formObject.affectedObjects = affectedObjects
          }
          if(action.type === 'trade'){//fix for multiple people
            if(player === username){
              affectedObjects[affectedObjects.length-1].player = {name:player, card:cloneImg.name}
            }else {
              affectedObjects[affectedObjects.length-1].opp = {name:player, card:cloneImg.name}
            }
            console.log('help', affectedObjects)
          }else{
            affectedObjects = affectedObjects.concat(
              //if statment is for showing all players case
              {name:(player instanceof Array)? player[i] : player, 
              card:cloneImg.name
            })
          }
          formObject.affectedObjects = affectedObjects

          cloneImg.className = 'highlight'

        }
        if(player instanceof Array){//for show multiple players case
          let nameText  = document.createElement(player[i]).innerHTML = player[i]
          actionElement.append(nameText)
        }
        actionElement.appendChild(cloneImg)
      }
    }
  }

  for(let action of output.send.action){
    switch(action.type){
      case 'sacrifice':
        //show player stable
      case 'discard':{
        //show player hand
        actionElement = document.createElement(action.type)
        actionElement.id = action.type
        actionElement.innerHTML = action.type
        document.getElementById('displayCards').appendChild(actionElement)
        let location = (action.type==='discard')? 'Hand':'Stable'

        img = document.getElementById(username+location).childNodes
        cardAction(action, img, username, actionElement)
        break
      }
      case 'destroy':
      case 'steal':
        //still needs to implment test function

        //show opponate's stable
        opponates = document.getElementById('score board').childNodes
        for(let j=1; j < opponates.length; j++ ){
          actionElement.id = action.type
          actionElement.innerHTML = action.type
          document.getElementById('displayCards').appendChild(actionElement)
          let opponateName = opponates[j].innerHTML
          actionElement.innerHTML += opponateName

          img = document.getElementById(opponateName+'Stable').childNodes
          cardAction(action, img, opponateName, actionElement)
        }
        break
      case 'draw'://test
        //show deck
        document.getElementById('displayCards').innerHTML += 'draw from deck?'
        affectedObjects = affectedObjects.concat({card: 'random'})
        break
      case 'bringBack':
        //shows everyones stable
        img = ['_']//needs '_' for cardAction function
        playerNames = ['_']
        actionElement = document.createElement(action.type)
        actionElement.id = action.type
        actionElement.innerHTML = action.type
        document.getElementById('displayCards').appendChild(actionElement)

        for(let i of document.getElementById('board').childNodes){
          if(i instanceof Element){//don't use html
            document.getElementById(i.id+'Stable').childNodes.forEach(
              function (currentValue) {
                if(currentValue instanceof Element) img = img.concat(currentValue) 
            })
            playerNames = playerNames.concat(i.id)
          }
        }
        cardAction(action, img, playerNames, actionElement)
        break
      case 'trade':
        //could show everyones hand or stable

        affectedObjects = affectedObjects.concat({player:'', opp:''})//to preset format for trade
        for(let i of document.getElementById('board').childNodes){
          if(i instanceof Element){//don't use html
            img = ['_']//needs '_' for cardAction function
            playerNames = ['_']
            actionElement = document.createElement(action.type)
            actionElement.id = action.type
            actionElement.innerHTML = action.type+' '+i.id//fix
            document.getElementById('displayCards').appendChild(actionElement)
            document.getElementById(i.id+action.location).childNodes.forEach(
              function (currentValue) {
                if(currentValue instanceof Element) img = img.concat(currentValue) 
            })
            cardAction(action, img, i.id, actionElement)
          }
        }
        break
    }
  }
  formObject = {card: card, location: location}
})


//to disable cards for next action that have already been selected above
//ex: actions should be done one by one so if a card is selected in an action above the cards below cant use same card
function test(action, cardName) {
  let test = document.getElementById('displayCards').childNodes
  for(let i of test){
    if (test.innerHTML !== action) console.log('/ts')
  }
}

//================================Btns=============================================

function confirm(){
  if (formObject.affectedObjects === undefined) return
  socket.emit('filledForm', username, formObject.card, formObject.affectedObjects, formObject.location)
  formObject = {}
}

function ready() {
  socket.emit('ready', username)
}
function deck() {
  document.getElementById('from').style.display = 'block'
  document.getElementById('to').style.display = 'block'
  document.getElementById("show").innerHTML += ' deck'
  document.getElementById("display").style.display = "block"
}
function discard() {
  document.getElementById('from').style.display = 'block'
  document.getElementById('to').style.display = 'block'
  document.getElementById("show").innerHTML += ' discard'
  document.getElementById("display").style.display = "block"
}
function pass() {
  socket.emit('pass', username);
  console.log(username + " passed phase")
}
//have the undo button be able to undo phases if nessisary
function undo() { // try to make it so they cant undo when no moves have been done
  socket.emit('undo', username);
  console.log(username + " undo action")
}
function interupt(toWho) {
  document.getElementById('interupt').style.display = 'block'
  document.getElementById('from').style.display = 'none'
  document.getElementById('to').style.display = 'none'
  if (toWho) socket.emit('interupt', toWho);
  console.log(username, 'interupted', toWho)
}
function endPhase() {
  socket.emit('endPhase', username);
  console.log(username + " ends phase")
}
function endTurn() {
  socket.emit('endTurn', username);
  console.log(username + " ends turn")
  document.getElementById('endPhase').style.display = "block";
  document.getElementById('end turn').style.display = "none";
}

//=======================popup==========================================
// in gui have a way to look at any other domain like discard, hand, deck, etc

let openModalButtons = document.querySelectorAll('[data-modal-target')
let closeModalButtons = document.querySelectorAll('[data-close-button')
let overlay = document.getElementById('overlay')

openModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.querySelector(button.dataset.modalTarget)
    openModal(modal)
  })
})

overlay.addEventListener('click', () => { //closes popup when clicking outside of popup
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal')
    closeModal(modal)
  })
})


function visabile() {//spesify visabilaty for deck and discard 
  let where = document.getElementById("show").innerHTML.slice(5)//gets where
  socket.emit('getDeckOrDis', username, where);
  document.getElementById("show").style.display = 'none'
  document.getElementById("hidden").style.display = 'none'
}

function openModal(modal) {
  if (gameOver) return
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
  document.getElementById("display").style.display = "none"
  document.getElementById("interupt").style.display = "none"
  //clear card img and text in popup
  document.getElementById('displayCards').innerHTML = ''
  //hide confrim btn
  document.getElementById('confirm').style.display = 'none'
}
//moves cards in gui without the need a ping from server
//cuently card param can not take list
//could have multiplay card moves
function updateBoard(card, from, to) {//fix array thing with to
  if (card instanceof Array) card = card[0];//fix
  //have a checks if it is player's turn
  if (from == "deck" || from == "discard") {
    return
  }
  if (to == "deck" || to == "discard") {
    //fix
    let x =document.getElementById(from[0]+from[1])//to insure it grabs the card from the right domain if multiple people have the same card
    for(let i of x.childNodes) {
      if (i.id===card.name){
        document.getElementById(from[0] + from[1]).removeChild(i)
      }
    }
  } else { 
    //fix
    let x = document.getElementById(from[0]+from[1])//to insure it grabs the card from the right domain if multiple people have the same card
    for(let i of x.childNodes) {
      if (i.id===card.name){
        document.getElementById(to[0] + to[1]).appendChild(i)
      }
    }
  }
}

//==========Debug code============
socket.on("DEBUG_autofill", function (name) {
  if (username == '') {
    document.getElementById("username_input").value = name
    document.getElementById("b").click()
    if (name == "host") {
      document.getElementById("ready").click()
    }
  }
});//*/