var express = require('express');
var router = express.Router();
const path = require('path');
let food;
let player;
router.get('/', function(req, res, next) {
	let socket_id = [];
	const io = req.app.get('socketio');

	io.on('connection', socket => {
		socket_id.push(socket.id);
		if (socket_id.length > 2) return;
		socket.broadcast.emit('newplayer', { food, player });

		socket.emit('hello', socket.id);
		socket.on('first_touch', data => {
			console.log('received', data);
			food = data.food;
			player = data.player;
		});
		socket.on('imoved', msg => {
			console.log('just got: ', msg);
			socket.broadcast.emit('movedata', msg);
		});
	});

	res.sendFile(path.join(__dirname, '..', 'public/sketch.html'));
});

module.exports = router;
