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
  for (var element in playerList) {
    let btn = document.createElement("BUTTON")
    btn.innerHTML = playerList[element]; // change this to the player's names
    document.getElementById('players').appendChild(btn)
    var item = document.createElement('li');
    item.textContent = playerList[element];
    document.getElementById("score board").appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  }
});

/*socket.on("draw", function(player) {
  console.log(player+" played a card")
});*/
function ready() {
  socket.emit('ready', username)
}
function draw(){
  //socket.emit('chat message', username.value+": draw");
  socket.emit('draw', username);
  console.log(username+' draw')
  socket.emit('next', username);
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