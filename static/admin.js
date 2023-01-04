var socket = io()
var $roomEnter = $('#start')
var $roomField = $('#room')
var $panel = $('#panel')
var $shareLink = $('#shareLink')
var $startButton = $('#startButton')
var $roomCount = $('#roomCount')
var $lobby = $('#lobby')
var data = { room: null }
var count = 0
var lobby = {}


// emit a 'create' event on submission along with the room requested
$roomEnter.on('submit', function(event) {
    event.preventDefault()
    data.room = $roomField.val()
    socket.emit('create', data)
})
// listen to a successful or failed 'create' reply from the server
socket.on('create', function(success) {
    if (success) {
        $roomEnter.hide()
        $panel.show()
        $shareLink.val(window.location.host + '/' + data.room)
    }
    else {
        alert('That room is taken')
    }
})

socket.on('join', function(data) {
    count++
    $roomCount.text('num players: '+count)
    $lobby.append(`<li class="panel_header">${data.name}</li>`) // in JavaScript, we can create template strings between `` backticks with string representations of any JavaScript expression surrounded by ${}
    lobby[data.name] = 0
})

socket.on('leave', function() {
    count--
    $roomCount.text('num players: '+count)
})

$startButton.on('click', function() {
    $startButton.hide()
    socket.emit('begin', data)
    window.location = '/' + data.room
  })
