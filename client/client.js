// try to make sure multiple players dont take the same username
var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var usernameInputValue = document.getElementById('username_input')
var username = '';

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) { // make it so they cant use chat before they enter a username
    socket.emit('chat message', username+": "+input.value);
    input.value = '';
  }
  if (usernameInputValue.value){
    socket.emit('username input', usernameInputValue.value);
    username = usernameInputValue.value
    usernameInputValue.value = '';
    document.getElementById("username").remove();
    usernameInputValue.remove();
    document.getElementById("b").remove();
    document.getElementById("displayName").innerHTML = "Player: "+username
  }
});

socket.on('chat message', function(msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("num of players", function(playerList){
  document.getElementById("ready").remove();
  document.getElementById('phaseUI').innerHTML = "Beginning Of Turn Phase";
	let item, opponate, hand, stable, name, img;// fix
  for (var element in playerList) {
    name = playerList[element]
    if (username != name){
      // displaying player names gui
      item = document.createElement('li');
      item.textContent = name; 
      document.getElementById("score board").appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
      // creating opponate gui
      opponate = document.createElement(('div'));
      opponate.id = name;
      opponate.innerHTML = name+"'s cards: ";
      document.getElementById("board").append(opponate)
      hand = document.createElement('div');
      hand.innerHTML = 'Hand:'
      img = document.createElement("IMG")
      img.setAttribute("data-modal-target", '#modal')
      img.id = name+"Hand"
      hand.append(img)
      document.getElementById(name).append(hand)
      stable = document.createElement('div');
      stable.innerHTML = 'Stable:'
      img = document.createElement("IMG")
      img.setAttribute("data-modal-target", '#modal')
      img.id = name+"Stable"
      stable.append(img)
      document.getElementById(name).append(stable)
    }
  }
});

//shows all action btn
socket.on("turn start", function(name){
  document.getElementById('whosTurn').innerHTML = 'Turn: '+ name
  if (username == name){
    elem = document.getElementById('btn');
    elem.style.display = "block";
  } else {
    elem = document.getElementById('btn');
    elem.style.display = "none";
  }
})

socket.on("phase", function(phase, name){
  let text;
  switch(phase){
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
      if (name == username){
        document.getElementById('endPhase').style.display = "none";
        document.getElementById('end turn').style.display = "block";
      }
      break
  }
  console.log('phase: '+text)
  document.getElementById('phaseUI').innerHTML = text;
});

// reciving imgs
socket.on("image", function(info, where, forWho) {
  if (forWho == username){
    if (info.image) {
      let img = document.getElementById(where)
      //img.setAttribute("data-modal-target", '#modal')
      img.src = 'data:image/jpeg;base64,' + info.buffer;
      img.setAttribute("width", 150)
      img.setAttribute("height", 200)
    }
  }
});
//================================Btns=============================================
function ready() {
  socket.emit('ready', username)
}
//have the undo button be able to undo phases if nessisary
function undo(){ // try to make it so they cant undo when no moves have been done
  socket.emit('undo', username);
  console.log(username+" undo action")
}
function pass(){
  socket.emit('pass', username);
  console.log(username+" passed phase")
}
function endPhase(){
  socket.emit('endPhase', username);
  console.log(username+" ends phase")
}
function endTurn(){
  socket.emit('endTurn', username);
  console.log(username+" ends turn")
  document.getElementById('endPhase').style.display = "block";
  document.getElementById('end turn').style.display = "none";
}

// in gui have a way to look at any other domain like discard, hand, deck, etc

//make pop up gui when choosing spesifucly who or amound or what goes to
//also spesify to which players or how many players stuff cuz it could be all players or just one
//make it so it cant movve to the same place (exseption like in deck move to top of deck)
//move functions
function move(card, from, to) {//to could just be 1, multiple, or all
  socket.emit('move', username, card, from, to);
  console.log(username+' moved '+ card + 'from ' + from + ' to ' + to)
}

//make some sourt of intuerupt or cut in line when reqiring other player's actions

//=======================popup==========================================
const openModalButtons = document.querySelectorAll('[data-modal-target')
console.log(openModalButtons)
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
    modals.forEach( modal => {
        closeModal(modal)
    })
})

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal')
        closeModal(modal)
    })
})

function openModal(modal) {
    if (modal == null) return
    modal.classList.add('active')
    overlay.classList.add('active')
}

function closeModal(modal) {
    if (modal == null) return
    modal.classList.remove('active')
    overlay.classList.remove('active')
}