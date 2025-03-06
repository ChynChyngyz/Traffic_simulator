const canvas = document.createElement('canvas');
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;
let ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

var carRadius = 10;
var safteyDistance = carRadius + 5;
var semaphoreIntervals = 400;
var carSpeed = 3;
var pushCarEveryNFrames = 30;

var Car = function (startPoint) {
    this.x = startPoint.x;
    this.y = startPoint.y;
    this.dx = startPoint.dx;
    this.dy = startPoint.dy;
    this.memdx = this.dx;
    this.memdy = this.dy;
    this.radius = carRadius;

    // Выбор изображения в зависимости от направления
    if (this.dx > 0) {
        this.img = document.getElementById('carRight');
    } else if (this.dx < 0) {
        this.img = document.getElementById('carLeft');
    } else if (this.dy > 0) {
        this.img = document.getElementById('carDown');
    } else if (this.dy < 0) {
        this.img = document.getElementById('carUp');
    }
};

Car.prototype.stop = function () {
	this.dx = 0;
	this.dy = 0;
};
Car.prototype.start = function () {
	this.dx = this.memdx;
	this.dy = this.memdy;
};
Car.prototype.move = function () {
	ctx.clearRect (this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
	this.x += this.dx;
	this.y += this.dy;
};
Car.prototype.draw = function() {
    ctx.save();
    // Рисуем изображение вместо круга
    ctx.drawImage(
        this.img,
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        this.radius * 2
    );
    ctx.restore();
};

var Semaphore = function (loc) {
	this.loc = loc;
	if (loc.greenOn) {
		this.light = 2;
		this.counter = semaphoreIntervals;
		this.counterdir = -1;
	} else {
		this.light = 0;
		this.counter = 0;
		this.counterdir = 1;
	}
};

Semaphore.prototype.draw = function () {
	ctx.save();
	var anchorx = this.loc.x;
	var anchory = this.loc.y;

	if (this.loc.dy < 0) {
		anchorx = this.loc.x;
		anchory = this.loc.y - (2 * this.loc.dy);
	} else if (this.loc.dx < 0) {
		anchorx = this.loc.x - (2 * this.loc.dx);
		anchory = this.loc.y;
	}

	ctx.fillStyle = 'black';
	ctx.fillRect (this.loc.x, this.loc.y, this.loc.width, this.loc.height);
	ctx.beginPath();
	ctx.fillStyle = 'gray';
	if (this.light === 0) {
		ctx.fillStyle = 'red';
	}
	var x = anchorx + (0 * this.loc.dx + 15);
	var y = anchory + (0 * this.loc.dy + 15);
	ctx.arc(x,y, 10, 0, Math.PI * 2, true);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = 'gray';
	if (this.light == 1) {
		ctx.fillStyle = 'orange';
	}
	x = anchorx + (1 * this.loc.dx + 15);
	y = anchory + (1 * this.loc.dy + 15);
	ctx.arc(x, y, 10, 0, Math.PI * 2, true);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = 'gray';
	if (this.light == 2) {
		ctx.fillStyle = 'green';
	}
	x = anchorx + (2 * this.loc.dx + 15);
	y = anchory + (2 * this.loc.dy + 15);
	ctx.arc(x, y, 10, 0, Math.PI * 2, true);
		ctx.fill();

		ctx.restore();
};

Semaphore.prototype.check = function () {
	this.counter = (this.counter + this.counterdir);
	if (this.counter > semaphoreIntervals) {
		this.counterdir = -1;
	}
	if (this.counter <= 0) {
		this.counterdir = 1;
	}
	if (this.counter < semaphoreIntervals * 0.6) {
		this.light = 0;
	}
	if (this.counter >= semaphoreIntervals * 0.6 && this.counter < semaphoreIntervals * 0.65) {
		this.light = 1;
	}
	if (this.counter >= semaphoreIntervals * 0.65) {
		this.light = 2;
	}
};

var leftStart = {
	x : 0 + carRadius,
	y : canvas.height / 2 + safteyDistance,
	dx : carSpeed,
	dy : 0
};
var rightStart = {
	x : canvas.width - carRadius,
	y : canvas.height / 2 - safteyDistance,
	dx: -1 * carSpeed,
	dy: 0
};
var topStart = {
	x : canvas.width / 2 - safteyDistance,
	y : 0 + 2 * carRadius,
	dx : 0,
	dy : carSpeed
};
var bottomStart = {
	x : canvas.width / 2 + safteyDistance,
	y : canvas.height - 2 * carRadius,
	dx: 0,
	dy: -1 * carSpeed
};

var semLeft = {
	x: topStart.x - safteyDistance - carRadius / 2 - 75,
	y: leftStart.y + safteyDistance + carRadius / 2,
	width: 75,
	height: 30,
	dx: -22,
	dy: 0,
	greenOn : false,
	horizontal: true
};
var semRight = {
	x: bottomStart.x + safteyDistance + carRadius / 2,
	y: rightStart.y - carRadius / 2 - safteyDistance - 30,
	width: 75,
	height: 30,
	dx: 22,
	dy: 0,
	greenOn : false,
	horizontal: true
};
var semUp = {
	x: topStart.x - safteyDistance - carRadius / 2 - 30,
	y: rightStart.y - carRadius / 2 - safteyDistance - 75,
	width: 30,
	height: 75,
	dx: 0,
	dy: -22,
	greenOn : true
};
var semBottom = {
	x: bottomStart.x + safteyDistance + carRadius / 2,
	y: leftStart.y + safteyDistance + carRadius / 2,
	width: 30,
	height: 75,
	dx: 0,
	dy: 22,
	greenOn : true
};

//lane
var Lane = function (type) {
	this.type = type;

	if (type === 'vertical') {
		this.upLineStart = {
			x: topStart.x - safteyDistance - carRadius / 2,
			y: 0
		};
	} else {
		this.upLineStart = {
			x: canvas.width,
			y: rightStart.y - carRadius / 2 - safteyDistance
		};
	}
	if (type === 'vertical') {
		this.upLineBreak = {
			x: topStart.x - safteyDistance - carRadius / 2,
			y: rightStart.y - carRadius / 2 - safteyDistance
		};
	} else {
		this.upLineBreak = {
			x: bottomStart.x + safteyDistance + carRadius / 2,
			y: rightStart.y - carRadius / 2 - safteyDistance
		};
	}
	if (type === 'vertical') {
		this.upLineBreakStart = {
			x: topStart.x - safteyDistance - carRadius / 2,
			y: leftStart.y + safteyDistance + carRadius / 2
		};
	} else {
		this.upLineBreakStart = {
			x: topStart.x - safteyDistance - carRadius / 2,
			y: rightStart.y - carRadius / 2 - safteyDistance
		};
	}
	if (type === 'vertical') {
		this.upLineBreakEnd = {
			x: topStart.x - safteyDistance - carRadius / 2,
			y: canvas.height
		};
	} else {
		this.upLineBreakEnd = {
			x: 0,
			y: rightStart.y - carRadius / 2 - safteyDistance
		};
	}
	// "up" line fence end

	// "down" line fence
	if (type === 'vertical') {
		this.downLineStart = {
			x: bottomStart.x + safteyDistance + carRadius / 2,
			y: canvas.height
		};
	} else {
		this.downLineStart = {
			x: 0,
			y: leftStart.y + safteyDistance + carRadius / 2
		};
	}
	if (type === 'vertical') {
		this.downLineBreak = {
			x: bottomStart.x + safteyDistance + carRadius / 2,
			y: leftStart.y + safteyDistance + carRadius / 2
		};
	} else {
		this.downLineBreak = {
			x: topStart.x - safteyDistance - carRadius / 2,
			y: leftStart.y + safteyDistance + carRadius / 2
		};
	}
	if (type === 'vertical') {
		this.downLineBreakStart = {
			x: bottomStart.x + safteyDistance + carRadius / 2,
			y: rightStart.y - carRadius / 2 - safteyDistance
		};
	} else {
		this.downLineBreakStart = {
			x: bottomStart.x + safteyDistance + carRadius / 2,
			y: leftStart.y + safteyDistance + carRadius / 2
		};
	}
	if (type === 'vertical') {
		this.downLineBreakEnd = {
			x: bottomStart.x + safteyDistance + carRadius / 2,
			y: 0
		};
	} else {
		this.downLineBreakEnd = {
			x: canvas.width,
			y: leftStart.y + safteyDistance + carRadius / 2
		};
	}

	if (type === 'vertical') {
		this.upSem = new Semaphore(semUp);
		this.downSem = new Semaphore(semBottom);
		this.upLaneStart = topStart;
		this.downLaneStart = bottomStart;
		this.upStop = rightStart.y - 2 * carRadius - safteyDistance;
		this.downStop = leftStart.y + safteyDistance + 2 * carRadius;
	} else {
		this.upSem = new Semaphore(semRight);
		this.downSem = new Semaphore(semLeft);
		this.upLaneStart = rightStart;
		this.downLaneStart = leftStart;
		this.upStop = bottomStart.x + safteyDistance + 2 * carRadius;
		this.downStop = topStart.x - safteyDistance - 2 * carRadius;
	}

	this.upLaneCars = [new Car(this.upLaneStart)];
	this.downLaneCars = [new Car(this.downLaneStart)];
	this.counter = 0;
};

Lane.prototype.check = function () {
	this.upSem.check();
	this.downSem.check();

	// check add new car cycle
	this.counter += 1;
	if ((this.counter % pushCarEveryNFrames) === 0) {
		var lastUpCar = this.upLaneCars[this.upLaneCars.length - 1];
		var lastDownCar = this.downLaneCars[this.downLaneCars.length - 1];

		var newUpCar = new Car(this.upLaneStart);
		var newDownCar = new Car(this.downLaneStart);

		if (lastUpCar) {
			if (Math.abs(lastUpCar.x - newUpCar.x) > (carRadius + safteyDistance) ||
				Math.abs(lastUpCar.y - newUpCar.y) > (carRadius + safteyDistance)) {
				this.upLaneCars.push(newUpCar);
			}
		} else {
			this.upLaneCars.push(newUpCar);
		}

		if (lastDownCar) {
			if (Math.abs(lastDownCar.x - newDownCar.x) > (carRadius + safteyDistance) ||
				Math.abs(lastDownCar.y - newDownCar.y) > (carRadius + safteyDistance)) {
				this.downLaneCars.push(newDownCar);
			}
		} else {
			this.downLaneCars.push(newDownCar);
		}
	}

	for (var i = 0; i < this.upLaneCars.length; i++) {
		if (this.upSem.light === 0 || this.upSem.light == 1) {
			if (this.type === 'vertical') {
				if (this.upLaneCars[i].y <= this.upStop) {
					if ((this.upLaneCars[i].y + this.upLaneCars[i].dy) > this.upStop) {
						this.upLaneCars[i].stop();
					}
				}
			} else {
				if (this.upLaneCars[i].x >= this.upStop) {
					if ((this.upLaneCars[i].x + this.upLaneCars[i].dx) < this.upStop) {
						this.upLaneCars[i].stop();
					}
				}
			}
		} else {
			this.upLaneCars[i].start();
		}

		if (i > 0) {
			if (this.type === 'vertical') {
				if ((this.upLaneCars[i-1].y - this.upLaneCars[i].y + this.upLaneCars[i].dy) < (2 * carRadius + safteyDistance)) {
					this.upLaneCars[i].stop();
				}
			} else {
				if ((this.upLaneCars[i].x + this.upLaneCars[i].dx - this.upLaneCars[i-1].x) < (2 * carRadius + safteyDistance)) {
					this.upLaneCars[i].stop();
				}
			}
		}

		this.upLaneCars[i].move();
	}

	if (this.upLaneCars.length > 0) {
		if (this.upLaneCars[0].x < 0 ||
			this.upLaneCars[0].x > canvas.width ||
			this.upLaneCars[0].y < 0 ||
			this.upLaneCars[0].y > canvas.height) {

			this.upLaneCars.splice(0, 1);
		}
	}

	for (i = 0; i < this.downLaneCars.length; i++) {
		if (this.downSem.light === 0 || this.downSem.light == 1) {
			if (this.type === 'vertical') {
				if (this.downLaneCars[i].y >= this.downStop) {
					if ((this.downLaneCars[i].y + this.downLaneCars[i].dy) < this.downStop) {
						this.downLaneCars[i].stop();
					}
				}
			} else {
				if (this.downLaneCars[i].x <= this.downStop) {
					if ((this.downLaneCars[i].x + this.downLaneCars[i].dx) > this.downStop) {
						this.downLaneCars[i].stop();
					}
				}
			}
		} else {
			this.downLaneCars[i].start();
		}

		if (i > 0) {
			if (this.type === 'vertical') {
				if ((this.downLaneCars[i].y + this.downLaneCars[i].dy - this.downLaneCars[i-1].y) < (2 * carRadius + safteyDistance)) {
					this.downLaneCars[i].stop();
				}
			} else {
				if ((this.downLaneCars[i-1].x - this.downLaneCars[i].x + this.downLaneCars[i].dx) < (2 * carRadius + safteyDistance)) {
					this.downLaneCars[i].stop();
				}
			}
		}

		this.downLaneCars[i].move();
	}

	if (this.downLaneCars.length > 0) {
		if (this.downLaneCars[0].x < 0 ||
			this.downLaneCars[0].x > canvas.width ||
			this.downLaneCars[0].y < 0 ||
			this.downLaneCars[0].y > canvas.height) {

			this.downLaneCars.splice(0, 1);
		}
	}
};

Lane.prototype.draw = function () {
    ctx.save();

    // Рисуем дорожное полотно
    ctx.fillStyle = '#2a2a2a'; // Темно-серый цвет

    if (this.type === 'vertical') {
        // Вертикальная дорога
        ctx.fillRect(
            this.upLineStart.x,
            0,
            70,
            canvas.height
        );
    } else {
        // Горизонтальная дорога
        ctx.fillRect(
            0,
            this.upLineStart.y,
            canvas.width,
            70
        );
    }

    // Рисуем сплошные разделительные линии
    ctx.strokeStyle = '#ffffff'; // Белый цвет линий
    ctx.lineWidth = 3;
    ctx.setLineDash([]); // Сплошная линия

    // Центральная линия
    if (this.type === 'vertical') {
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, 0);
        ctx.lineTo(canvas.width/2, canvas.height);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/2);
        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();
    }

    // Остальная существующая разметка (как было)
    ctx.beginPath();
    ctx.moveTo(this.upLineStart.x, this.upLineStart.y);
    ctx.lineTo(this.upLineBreak.x, this.upLineBreak.y);
    ctx.moveTo(this.upLineBreakStart.x, this.upLineBreakStart.y);
    ctx.lineTo(this.upLineBreakEnd.x, this.upLineBreakEnd.y);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.downLineStart.x, this.downLineStart.y);
    ctx.lineTo(this.downLineBreak.x, this.downLineBreak.y);
    ctx.moveTo(this.downLineBreakStart.x, this.downLineBreakStart.y);
    ctx.lineTo(this.downLineBreakEnd.x, this.downLineBreakEnd.y);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();

    // Остальной существующий код
    this.upSem.draw();
    this.downSem.draw();

    for (var i = 0; i < this.upLaneCars.length; i++) {
        this.upLaneCars[i].draw();
    }

    for (i = 0; i < this.downLaneCars.length; i++) {
        this.downLaneCars[i].draw();
    }
};

var laneh = new Lane('horizontal');
var lanev = new Lane('vertical');

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

(function animloop(){
	requestAnimFrame(animloop);

	laneh.check();
	lanev.check();

	laneh.draw();
	lanev.draw();

})();