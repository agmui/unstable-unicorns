const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path')

app.get('/', (req, res) => {
  res.sendFile(__dirname+'/client/index.html');
});

app.get('/client.js', (req, res) => {
  res.sendFile(__dirname+'/client/client.js');
});

app.get('/client.css', (req, res) => {
  res.sendFile(process.cwd()+'/client/client.css');
});

io.on('connection', (socket) => {
    console.log('user joined');
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});

http.listen(8080, () => {
  console.log('listening on *:8080');
});