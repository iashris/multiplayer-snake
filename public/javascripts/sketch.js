var socket;
var myid;
var snake2;
var playerids = [];
class Snake {
	constructor(p, num) {
		this.body = [];
		this.body[0] = p;
		this.xdir = 0;
		this.ydir = 0;
		this.id = -1;
		this.len = 0;
		this.num = num;
	}

	setDir(x, y) {
		this.xdir = x;
		this.ydir = y;
		socket.emit('imoved', { id: myid, x: x, y: y });
	}

	update() {
		let head = this.body[this.body.length - 1].copy();
		this.body.shift();
		head.x += this.xdir;
		head.y += this.ydir;
		this.body.push(head);
	}

	grow() {
		let head = this.body[this.body.length - 1].copy();
		this.len++;
		this.body.push(head);
	}

	endGame() {
		let x = this.body[this.body.length - 1].x;
		let y = this.body[this.body.length - 1].y;
		if (x > w - 1 || x < 0 || y > h - 1 || y < 0) {
			return true;
		}
		for (let i = 0; i < this.body.length - 1; i++) {
			let part = this.body[i];
			if (part.x == x && part.y == y) {
				return true;
			}
		}
		return false;
	}

	eat(pos) {
		let x = this.body[this.body.length - 1].x;
		let y = this.body[this.body.length - 1].y;
		if (x == pos.x && y == pos.y) {
			this.grow();
			return true;
		}
		return false;
	}

	show() {
		for (let i = 0; i < this.body.length; i++) {
			fill(this.num == 1 ? 255 : 0);
			rect(this.body[i].x, this.body[i].y, 1, 1);
		}
	}
}

let snake;
let rez = 20;
let food;
let w;
let h;
let isPrimero = false;

function setup() {
	createCanvas(400, 400);
	socket = io.connect('http://localhost:3000');
	w = floor(width / rez);
	h = floor(height / rez);
	frameRate(5);
	snake = new Snake(createVector(floor(w / 2), floor(h / 2)), 1);
	snake2 = new Snake(createVector(floor(w / 2), floor(h / 2)), 2);
	foodLocation();
	socket.on('hello', id => {
		myid = id;
		snake.id = myid;
		socket.emit('first_touch', {
			food: { x: food.x, y: food.y },
			player: { x: snake.body[0].x, y: snake.body[0].y },
		});
	});
	socket.on('movedata', data => {
		if (data.id == myid) return;
		snake2.setDir(data.x, data.y);
	});
	socket.on('newplayer', data => {
		console.log(food);
		setFood(data.food);
		console.log(food);
		console.log('snake2 ka body was', snake2.body[0]);
		snake2.body[0] = createVector(data.player.x, data.player.y);
		console.log('snake2 ka body is', snake2.body[0]);
		alert('New player has joined!');
	});
}

function foodLocation() {
	let x = floor(random(w));
	let y = floor(random(h));
	food = createVector(x, y);
}
function setFood(fd) {
	food = createVector(fd.x, fd.y);
}
function keyPressed() {
	if (keyCode === LEFT_ARROW) {
		snake.setDir(-1, 0);
	} else if (keyCode === RIGHT_ARROW) {
		snake.setDir(1, 0);
	} else if (keyCode === DOWN_ARROW) {
		snake.setDir(0, 1);
	} else if (keyCode === UP_ARROW) {
		snake.setDir(0, -1);
	} else if (key == ' ') {
		snake.grow();
	}
}

function draw() {
	scale(rez);
	background(220);
	if (snake.eat(food)) {
		foodLocation();
	}

	snake.update();
	snake.show();
	snake2.update();
	snake2.show();

	if (snake.endGame()) {
		print('END GAME');
		background(255, 0, 0);
		noLoop();
	}

	noStroke();
	fill(255, 0, 0);
	rect(food.x, food.y, 1, 1);
}
