// try to make sure multiple players dont take the same username
var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var username = document.getElementById('username_input')

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', username.value+": "+input.value);
    input.value = '';
  }
  if (username.value){
    socket.emit('username input', username.value);
    console.log(username.value, 'help');
    input.value = '';
  }
});

socket.on('chat message', function(msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("username input", function(name) {
  console.log("1")
  //var username = document.createElement('li');
  //username.textContent = name;
  messages.appendChild(name);
});

socket.on("draw", function(player) {
  console.log(player+" played a card")
});

function draw(){
  socket.emit('chat message', username.value+": draw");
  socket.emit('draw', username.value);
  //console.log(username.value+' draw')
}
function discard(){
  socket.emit('chat message', username.value+": discard");
  socket.emit('discard', username.value);
  console.log(username.value+' discareded')
}
function play(){
  socket.emit('chat message', username.value+": play");
  socket.emit('play', username.value);
  console.log(username.value+' play')
}
function destroy(){
  socket.emit('chat message', username.value+": destroy");
  socket.emit('destroy', username.value);
  console.log(username.value+' destroyed')
}