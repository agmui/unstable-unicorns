var socket = io()
var $nameEnter = $('#nameEnter')
var $nameField = $('#name')
var $nameDisplay = $('#nameDisplay')
// var $state = $('#state')
var data = {
  room: window.location.pathname.split('/')[1], // get the first path
  name: null
}

$nameEnter.on('submit', function(event) {
    event.preventDefault()
    data.name = $nameField.val()
    $nameEnter.hide()
    $nameField.blur()
    $nameDisplay.innerHTML = "hi"//data.name
    socket.emit('join', data)
})

socket.on('begin', function() {
    console.log("begin game");
})