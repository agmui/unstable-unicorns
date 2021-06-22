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
      //fix
      //creating opponate gui in popup
      /*opponate = document.createElement("button")//from section gui not nessisary
      opponate.id = name
      opponate.onclick = function () { recivedClick([this.id, "Hand"], 1) }
      opponate.innerHTML = name + "'s hand"
      document.getElementById('from').append(opponate)
      opponate = document.createElement("button")
      opponate.id = name
      opponate.onclick = function () { recivedClick([this.id, "Stable"], 1) }
      opponate.innerHTML = name + "'s stable"
      document.getElementById('from').append(opponate)*/

      /*opponate = document.createElement("button")
      opponate.id = name
      opponate.onclick = function () { recivedClick([this.id, "Hand"], 2) }
      opponate.innerHTML = name + "'s hand"
      document.getElementById('to').append(opponate)
      opponate = document.createElement("button")
      opponate.id = name
      opponate.onclick = function () { recivedClick([this.id, "Stable"], 2) }
      opponate.innerHTML = name + "'s stable"
      document.getElementById('to').append(opponate)*/

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
  updateBoard(name, card, from, to)
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
    move(username, action.card, action.to, action.from, true);
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
    /*img.onclick = function () {//auto fills for move function
      //recivedClick(img.parentElement.id, 1)//fix formating not right
      if (img.parentElement.id==='PlayerHand' || img.parentElement.id==='PlayerStable'){
        recivedClick(img.parentElement.id.slice(6), 1)
      } else {
        let name = img.parentElement.parentElement.id
        recivedClick([name, img.parentElement.id.slice(name.length)],1)
      }
      recivedClick(img.id, 3) 
    }*/
    img.onclick = function() {
      let who =  img.parentElement.parentElement.id
      let location = img.parentElement.id.slice(who.length)
      //socket.emit('checkTapped', username, cardObject, [who, location])//ping class to check if card is tapped
      //exicutes card function on recived in recivedTapped
      socket.emit('play', username, cardObject, [who,location]);
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
  updatePopup()// allowes new img that has been loaded in to have popup
});

socket.on('recivedTapped', function(name, card, output, location) {
  if (username !== name ) return
  console.log('client.js: (output):', output.send)
  //open gui and fill form
  //socket.emit('filledForm', name, card, affectedCards, location)//ts
})

//================================Btns=============================================
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

//make pop up gui when choosing spesifucly who or amound or what goes to
//also spesify to which players or how many players stuff cuz it could be all players or just one
//make it so it cant movve to the same place (exseption like in deck move to top of deck)
//move functions
let from, to, card
function recivedClick(btnId, where) {//could have error with btn Id if multiple of the same cards are on screen
  switch (where) {
    case 1:
      from = btnId
      document.getElementById('confirm').innerHTML += 'from: ' + from + ' '
      break
    case 2:
      to = btnId
      document.getElementById('confirm').innerHTML += 'to: ' + to + ' '
      break
    case 3:
      document.getElementById('confirm').innerHTML = ''
      card = (btnId != 'random') ? allCards[btnId] : 'random';
      document.getElementById('confirm').innerHTML += 'card: ' + card + ' '
      break
  }
}

/*socket.on('cardClientClass', function(name, card, output){
  if(name !== username|| output==null)return
  console.log('from card.js:', output)//output can spesify if it needs to open modal
  document.getElementById('text').innerHTML += output.text;
  //alows gui to take input
  inputFormCard = card;
});
socket.on('final', function(output){
  document.getElementById('text').innerHTML= ''
  //code to handel board changes
  if(typeof output === 'string') {
    console.log(output);//if there is an error
    return
  } else if(output.numOfCards) {//applys to cards that need multipule card selections
    return
  }
  inputFormCard = false
})*/
// card should be a object, fix accepting list changes in from and to
function move(name_, card_, from_, to_, undo) {// fix
  if (name_) {//so far only undo functhion uses this
    socket.emit('move', name_, card_, from_, to_, undo);
    console.log(name_ + ' moved ' + card_.name + ' from ' + from_ + ' to ' + to_)
    updateBoard(name_, card_, from_, to_)
  } else {
    socket.emit('move', username, card, from, to);
    console.log(username + ' moved ' + card.name + ' from ' + from + ' to ' + to)
    //updateBoard(username, card, from, to)
  }
  document.getElementById('confirm').innerHTML = ''
  document.getElementById("display").style.display = "none"
  document.getElementById("interupt").style.display = "none"
}

//make some sourt of intuerupt or cut in line when reqiring other player's actions
function updatePopup() {
  const openModalButtons = document.querySelectorAll('[data-modal-target')
  const closeModalButtons = document.querySelectorAll('[data-close-button')
  const overlay = document.getElementById('overlay')

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
}

function visabile() {//spesify visabilaty for deck and discard 
  let where = document.getElementById("show").innerHTML.slice(5)//gets where
  socket.emit('getDeckOrDis', username, where);
  document.getElementById("show").style.display = 'none'
  document.getElementById("hidden").style.display = 'none'
}
function random() { // may need to say how many random cards get sent over
  //draw random from deck or discard
  recivedClick("random", 3)
  document.getElementById("display").style.display = 'none'
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
}
//moves cards in gui without the need a ping from server
//cuently card param can not take list
//could have multiplay card moves
function updateBoard(name, card, from, to) {//fix array thing with to
  if (card instanceof Array) {
    card = card[0];//fix
  }
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