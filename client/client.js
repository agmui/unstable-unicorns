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
  }
});

socket.on('chat message', function(msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

function draw(){
  socket.emit('chat message', username.value+": draw");
  console.log(username.value+' draw')
}
function discard(){
  socket.emit('chat message', username.value+": discard");
  console.log(username.value+' discareded')
}
function play(){
  socket.emit('chat message', username.value+": play");
  console.log(username.value+' play')
}
function destroy(){
  socket.emit('chat message', username.value+": destroy");
  console.log(username.value+' destroyed')
}