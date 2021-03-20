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
  for (var element in playerList) {
    let btn = document.createElement("BUTTON")
    btn.innerHTML = playerList[element]; 
    document.getElementById('players').appendChild(btn)
    var item = document.createElement('li');
    item.textContent = playerList[element];
    document.getElementById("score board").appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  }
});

socket.on("turn start", function(name){
  console.log(name+ "'s turn")  
  if (username == name){
    // update gui to display whos turn
    addBtn();
    //console.log('phase: '+phase) fix idk
  } else {
    // update gui to display whos turn
    for (let i = 0; i < 5; i++){
      elem = document.getElementById('actionBtn');
      if (typeof elem !== 'undefined' && elem !== null){
        elem.remove();
      }
    }
  }
})

socket.on("phase", function(phase){
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
  }
  console.log('phase: '+text)
  document.getElementById('phaseUI').innerHTML = text;
});


function ready() {
  socket.emit('ready', username)
}
function draw(){
  //socket.emit('chat message', username.value+": draw");
  socket.emit('draw', username);
  console.log(username+' draw')
}
function discard(){
  //socket.emit('chat message', username.value+": discard");
  socket.emit('discard', username);
  console.log(username+' discareded')
}
function play(){
  //socket.emit('chat message', username.value+": play");
  socket.emit('play', username);
  console.log(username+' play')
}
function destroy(){
  //socket.emit('chat message', username.value+": destroy");
  socket.emit('destroy', username);
  console.log(username+' destroyed')
}
function pass(){
  socket.emit('pass', username);
  console.log(username+' passed')
}
function undo(){ // try to make it so they cant undo when no moves have been done
  socket.emit('undo', username);
  console.log(username+" undo action")
}
function endTurn(){
  socket.emit('end', true);
  console.log(username+" ends turn")
}

function addBtn(){
  btn = document.createElement("BUTTON")
  btn.innerHTML = 'Draw'
  btn.id = 'actionBtn'
  btn.onclick = function(){draw()}
  document.body.appendChild(btn)

  btn = document.createElement("BUTTON")
  btn.innerHTML = 'Discard'
  btn.id = 'actionBtn'
  btn.onclick = function(){discard()}
  document.body.appendChild(btn)
 
  btn = document.createElement("BUTTON")
  btn.innerHTML = 'Play'
  btn.id = 'actionBtn'
  btn.onclick = function(){play()}
  document.body.appendChild(btn)

  btn = document.createElement("BUTTON")
  btn.innerHTML = 'Destroy'
  btn.id = 'actionBtn'
  btn.onclick = function(){destroy()}
  document.body.appendChild(btn)
  
  btn = document.createElement("BUTTON")
  btn.innerHTML = 'Pass'
  btn.id = 'actionBtn'
  btn.onclick = function(){pass()}
  document.body.appendChild(btn)
}