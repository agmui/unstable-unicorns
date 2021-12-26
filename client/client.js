// try to make sure multiple players dont take the same username
var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var usernameInputValue = document.getElementById('username_input')
var username = '';
let allCards = {};//todo
gameOver = false;
//let formObject = {}//used for sending back to server inputed form


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
    }
  }
});

//shows all action btn
socket.on("turn start", function (name) {
  document.getElementById('whosTurn').innerHTML = 'Turn: ' + name
  let btn = document.getElementById('btn');
  btn.style.display = (username === name)? 'block' : 'none';
})

socket.on("phase", function (text, name) {
  if (name === username && text === 'Press End Turn to continue') {
    //probs not necessary
    document.getElementById('endPhase').style.display = "none";
    document.getElementById('endTurn').style.display = "block";
  } else if (text === false) {
    //when player has do many cards
    text = "End of Turn Phase"
    console.log(name, 'has to many cards')
  }
  console.log('phase: ' + text)
  document.getElementById('phaseUI').innerHTML = text;
});
// when another player moves a card recives action here
socket.on("move", function (name, cardName, from, to, winner) {
  console.log("reciving move: " + name + ' moved ' + cardName+ ' from ' + from + ' to ' + to)

  //update client screen 
  //have a checks if it is player's turn
  if (from == "deck" || from == "discard") {
    return
  }
  let player = document.getElementById(name+from)
  //TODO: insure it grabs the card if multiple people have the same card
  if (to == "deck" || to == "discard") {
    //moving card to deck/discard
    for(let i of player.childNodes) {
      if (i.id===cardName){
        document.getElementById(name+from).removeChild(i)
        break
      }
    }
  } else { 
    //moving card from player to player
    for(let i of player.childNodes) {
      if (i.id===cardName){
        document.getElementById(to).appendChild(i)//fix
        break
      }
    }
  }

  if (winner) {//game over sequence
    console.log('winner:', winner);
    document.getElementById('btn').style.display = 'none'
    gameOver = true;//blocks furthure actions
    //add game over animation and popup here
  }
});

socket.on('fill', function(form, name){
  if(name !== username) return //check for correct player
  console.log('play request approved')

  let img, sendForm = [];
  //display action
  document.getElementById('displayCards').innerHTML = form.type+'\n'
  console.log('recived form:', form)//ts
  for(let i of form.display){
    //display the players name in popup
    document.getElementById('displayCards').insertAdjacentHTML('beforeend', i.name)

    //display cards in popup
    img = document.getElementById(i.name+i.location).cloneNode(true)
    for(let j of img.childNodes){
      //TODO: remove activated card form popup

      //TODO make clicking a card toggle and set up higlight
      j.onclick = () => {
        sendForm.push({
          //input card details
          name: i.name,
          location: i.location,
          cardName: j.id,
          type: form.type
        })
      }
    }
    document.getElementById('displayCards').appendChild(img)
  }
  //display confirm btn
  confirmBtnElement = document.getElementById('confirm')
  confirmBtnElement.style.display = 'block'
  confirmBtnElement.onclick = () => {confirmBtn(sendForm)}

});

//after pressing the confirm and server replys with no errors
socket.on('accepted input', function(output){
  if(output){
    if(output === 'accepted'){
      //normal case
      const modal = document.getElementById('modal')
      closeModal(modal)
    } else if('more actions'){
      //more actions case
      document.getElementById('displayCards').textContent = ''
    }
  } else {
    //if input is not accepted
    window.alert('invalid input')
  }
});

// =====================reciving imgs=================
socket.on("image", function (info, where, cardObject) {
  if (info.image) {
    let img = document.createElement("IMG")

    img.onclick = function() {
      let playerGettingLookedAt =  img.parentElement.parentElement.id
      let location = img.parentElement.id.slice(playerGettingLookedAt.length)
      console.log('sending play request')
      socket.emit('clickCard', username, cardObject.name, [playerGettingLookedAt, location]);

      //====opens popup===
      //TODO: checks are when a card is played form hand dont popup
      document.getElementById('text').innerHTML = cardObject.text
      const modal = document.querySelector(img.dataset.modalTarget)
      openModal(modal)
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

//================================Btns=============================================

function confirmBtn(formObject){
  if (formObject === undefined) return
  console.log('send this from back', formObject)
  socket.emit('filledForm', formObject)
  document.getElementById('confirm').style.display = 'none';
}

function ready() {
  socket.emit('ready', username)
}
function deck() {
  socket.emit('deckBtn')
  console.log(username + " drew from deck")
}
function pass() {
  socket.emit('passBtn', username);
  console.log(username + " passed phase")
}
function endPhase() {
  socket.emit('endPhaseBtn', username);
  console.log(username + " ends phase")
}
function endTurn() {
  socket.emit('endTurnBtn', username);
  console.log(username + " ends turn")
  document.getElementById('endPhase').style.display = "block";
  document.getElementById('endTurn').style.display = "none";
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
  //clear card img and text in popup
  document.getElementById('displayCards').innerHTML = ''
  //hide confrim btn
  document.getElementById('confirm').style.display = 'none'
  socket.emit('closedPopup')
}
//moves cards in gui without the need a ping from server
//cuently card param can not take list
//could have multiplay card moves

//plz fix ========================================================================================
//==========Debug code============
const delay = ms => new Promise(res => setTimeout(res, ms));

socket.on('debugPassOver', function (name) {
  if(name === username) debug(false)
})

function debug(sendBack=true) {
  let str = document.getElementById('whosTurn').innerHTML.substr(6)
  if(str !== username && sendBack===true){ 
    console.log('wrong btn')
    return
  }
  if('host' === username ){
    console.log("DEBUG")
    hostDebug()

    if(sendBack===true) socket.emit('debugPassOver', 'player1')
  } else if('player1' === username){
    console.log("DEBUG")
    player1Debug()
    if(sendBack===true) socket.emit('debugPassOver', 'host')
  }
}

//host====================================================
const hostDebug = async () => {
  /*await delay(500+100+50+100)
  findNode("hostHand", "Charming Bardicorn").click()

  await delay(100);
  findNode("steal", "Charming Bardicorn").click()
  document.getElementById("confirm").click()*/
};

//player1====================================================
async function player1Debug() {
  await delay(500);
  findNode("player1Hand", "Controled Destruction").click()

  await delay(100);
  /*findNode("steal", "The Great Narwhal").click()

  document.getElementById("confirm").click()

  document.getElementById("endPhase").click()
  document.getElementById("endPhase").click()
  await delay(50);
  document.getElementById("endTurn").click()*/
}

socket.on("DEBUG_autofill", function (name) {
  if (username == '') {
    document.getElementById("username_input").value = name
    document.getElementById("b").click()
    if (name == "host") {
      document.getElementById("ready").click()
    }
  }
});//*/
/*
* finds an child element in a parent element
* params: 
* elementId, parent element's id
* idName, child element's id
*
* returns an element
*/
function findNode(elementId, idName) {
  for(let i of document.getElementById(elementId).childNodes){
    if(i.id === idName){
      return i
    }
  }
}