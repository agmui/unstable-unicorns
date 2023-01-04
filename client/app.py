from flask import Flask, render_template, request, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room
import os

app = Flask(__name__)  # Flask wrapper
SECRET_KEY = os.urandom(32)  # a secret key for encryption purposes of size 32 bytes
app.config['SECRET_KEY'] = SECRET_KEY  # secret key for
socketio = SocketIO(app)  # SocketIO wrapper
socketio.init_app(app, cors_allowed_origins="*")  # when hosted on a real server, accept requests from clients


@app.route('/')  # the landing page at domain.com/
# the @ syntax indicates a function decorator
def index():
    return render_template('index.html')


@app.route('/admin')  # page for domain.com/admin
def admin():
    return render_template('admin.html')


@app.route('/<room>')  # page for domain.com/<any string that isn't 'admin'>
def play(room):
    return render_template('play.html')


# dictionary pairing room name to admin socket id
rooms = {}


def is_admin(id, room):
    # helper function to check if a socket is the admin of a room
    return rooms[room] == id


@socketio.on('connection')
def on_connect(socket):
    print('user connected')


@socketio.on('disconnect')
def on_admin_disconnect():
    print('user disconnected')
    for room in rooms:
        if is_admin(request.sid, room):
            del rooms[room]
    emit('leave')  # player disconnects are handled by the admin


@socketio.on('join')
def on_join(data):
    name = data['name']
    room = data['room']
    join_room(room)  # subscribe the socket that emitted the join event to the room
    emit('join', data, room=room)  # broadcast the event to the other sockets subscribed to the room
    print(f'{name} joined {room}')  # log the event on the server


@socketio.on('leave')
def on_leave(data):
    name = data['username']
    room = data['room']
    leave_room(room)
    emit('leave', data, room=room)  # broadcast the event to the other sockets subscribed to the room
    print(f'{name} left {room}')  # log the event on the server


@socketio.on('exists')
def exists(data):
    room = data['room']
    emit('exists', room in rooms)  # returns a Boolean indicating the existence of a key in the dictionary


@socketio.on('create')
def on_create(data):
    room = data['room']
    if (room in rooms or len(room) < 3):  # room names have to be unique and at least 2 characters long
        emit('create', False)
    else:
        join_room(room)
        rooms[room] = request.sid  # we can use request.sid to get the socket's unique id
        emit('create', True)
        print(f'created room: {room}')

@socketio.on('begin')
def on_begin(data):
    room = data['room']
    if is_admin(request.sid, room):
        emit('begin', room=room)

if __name__ == '__main__':
    socketio.run(app, allow_unsafe_werkzeug=True)
