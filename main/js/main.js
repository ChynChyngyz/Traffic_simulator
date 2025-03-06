const canvas = document.getElementById("trafficCanvas");
const ctx = canvas.getContext("2d");

let laneh = { cars: [] };
let lanev = { cars: [] };

const roadWidth = Math.min(canvas.width, canvas.height) * 0.3; // Ширина дороги
const laneOffsetRight = (roadWidth / 4)+45;
const laneOffset = (roadWidth / 4)-65;

const stopLineX = canvas.width / 2
const stopLineY = canvas.height / 2

let horizontalTrafficLightState = 0; // 0 - Красный, 1 - Желтый, 2 - Зеленый (для горизонтальных светофоров)
let verticalTrafficLightState = 0;   // 0 - Красный, 1 - Желтый, 2 - Зеленый (для вертикальных светофоров)
let horizontalRedDuration = 5000;
let verticalGreenDuration = 5000;
const yellowDuration = 1000;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawIntersection(); // Рисуем пересечение при изменении размера
}

function drawIntersection() {
    const roadWidth = Math.min(canvas.width, canvas.height) * 0.3;
    ctx.fillStyle = "#2b2b2b";

    ctx.fillRect(0, canvas.height / 2 - roadWidth / 2, canvas.width, roadWidth);
    ctx.fillRect(canvas.width / 2 - roadWidth / 2, 0, roadWidth, canvas.height);

    drawRoadMarkings(roadWidth);
    drawTrafficLights(roadWidth);

    drawStopLine(roadWidth)
}

function drawStopLine(roadWidth) {
    ctx.setLineDash([]);
    ctx.strokeStyle = "#2b2b2b";

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - roadWidth / 2, canvas.height / 2 - roadWidth / 2);
    ctx.lineTo(canvas.width / 2 + roadWidth / 2, canvas.height / 2 - roadWidth / 2);
    ctx.lineTo(canvas.width / 2 + roadWidth / 2, canvas.height / 2 + roadWidth / 2);
    ctx.lineTo(canvas.width / 2 - roadWidth / 2, canvas.height / 2 + roadWidth / 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.fillStyle = "#2b2b2b";
    ctx.fill();
}

function drawRoadMarkings() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);

    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

function drawTrafficLights(roadWidth) {
    const lightSize = 20;
    const lightPositions = [
        { x: canvas.width / 2 - roadWidth / 2 - 90, y: canvas.height / 2 - roadWidth / 2 - 30 }, // левый верхний
        { x: canvas.width / 2 + roadWidth / 2, y: canvas.height / 2 + roadWidth / 2 },  // правый нижний
        { x: canvas.width / 2 + roadWidth / 2, y: canvas.height / 2 - roadWidth / 2 - 90 },  // правый верхний
        { x: canvas.width / 2 - roadWidth / 2 - 30, y: canvas.height / 2 + roadWidth / 2 }   // левый нижний
    ];

    lightPositions.forEach((pos, index) => {
        ctx.fillStyle = "black";

        if (index === 0 || index === 1) {
            ctx.fillRect(pos.x, pos.y, 90, 30);  // Горизонтальный корпус
        }
        if (index === 2 || index === 3) {
            ctx.fillRect(pos.x, pos.y, 30, 90);  // Вертикальный корпус
        }

        let redColor = "darkred", yellowColor = "darkgoldenrod", greenColor = "darkgreen";

        if (index === 0 || index === 1) {
            if (horizontalTrafficLightState === 0) {
                redColor = "red";
                yellowColor = "gray";
                greenColor = "gray";
            } else if (horizontalTrafficLightState === 1) {
                redColor = "gray";
                yellowColor = "yellow";
                greenColor = "gray";
            } else if (horizontalTrafficLightState === 2) {
                redColor = "gray";
                yellowColor = "gray";
                greenColor = "green";
            }

            drawTrafficLightCircle(pos.x, pos.y, lightSize, redColor, 15, 15);
            drawTrafficLightCircle(pos.x, pos.y, lightSize, yellowColor, 45, 15);
            drawTrafficLightCircle(pos.x, pos.y, lightSize, greenColor, 75, 15);
        }

        if (index === 2 || index === 3) {
            if (verticalTrafficLightState === 0) {
                redColor = "red";
                yellowColor = "gray";
                greenColor = "gray";
            } else if (verticalTrafficLightState === 1) {
                redColor = "gray";
                yellowColor = "yellow";
                greenColor = "gray";
            } else if (verticalTrafficLightState === 2) {
                redColor = "gray";
                yellowColor = "gray";
                greenColor = "green";
            }

            drawTrafficLightCircle(pos.x, pos.y, lightSize, redColor, 15, 15);
            drawTrafficLightCircle(pos.x, pos.y, lightSize, yellowColor, 15, 45);
            drawTrafficLightCircle(pos.x, pos.y, lightSize, greenColor, 15, 75);
        }
    });
}

function drawTrafficLightCircle(x, y, size, color, offsetX, offsetY) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + offsetX, y + offsetY, size / 2, 0, Math.PI * 2);
    ctx.fill();
}

function changeTrafficLight() {
    if (horizontalTrafficLightState === 0) {
        horizontalTrafficLightState = 1;
        setTimeout(changeTrafficLight, yellowDuration);
    } else if (horizontalTrafficLightState === 1) {
        horizontalTrafficLightState = 2;
        verticalTrafficLightState = 0;
        setTimeout(changeTrafficLight, verticalGreenDuration);
    } else {
        horizontalTrafficLightState = 0;
        verticalTrafficLightState = 2;
        setTimeout(changeTrafficLight, horizontalRedDuration);
    }
    drawIntersection();
}

function updateTrafficLightTimer() {
    horizontalRedDuration = document.getElementById("redTime").value * 1000;
    verticalGreenDuration = document.getElementById("greenTime").value * 1000;
    console.log(`Обновленные таймеры: Красный для горизонтальных - ${horizontalRedDuration / 1000} сек, Зеленый для вертикальных - ${verticalGreenDuration / 1000} сек`);
}

// Объект машины
class Car {
    constructor(startPoint) {
        this.x = startPoint.x;
        this.y = startPoint.y;
        this.dx = startPoint.dx;
        this.dy = startPoint.dy;
        this.memdx = this.dx;
        this.memdy = this.dy;
        this.width = 60; // Ширина изображения машины
        this.height = 30; // Высота изображения машины

        // Определяем изображение в зависимости от направления
        if (this.dx > 0) {
            this.image = document.getElementById("carRight");
        } else if (this.dx < 0) {
            this.image = document.getElementById("carLeft");
        } else if (this.dy > 0) {
            this.image = document.getElementById("carDown");
        } else if (this.dy < 0) {
            this.image = document.getElementById("carUp");
        }
    }

    stop() {
        this.dx = 0;
        this.dy = 0;
    }

    start() {
        this.dx = this.memdx;
        this.dy = this.memdy;
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw() {
        if (this.image) {
            ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
    }

    // Проверка, находится ли машина перед стоп-линией
    isBeforeStopLine() {
        if (this.dx > 0) { // Движение вправо
            return (this.x + this.width) / 2 <= stopLineX;
        } else if (this.dx < 0) { // Движение влево
            return (this.x - this.width) / 2 >= stopLineX
        } else if (this.dy > 0) { // Движение вниз
            return (this.y + this.height) / 2 <= stopLineY;
        } else if (this.dy < 0) { // Движение вверх
            return (this.y - this.height) / 2 >= stopLineY;
        }
        return false;
    }
}

setInterval(function () {
    let speed = parseInt(document.getElementById("carSpeed").value);
    // Горизонтальные машины (слева направо)
    laneh.cars.push(new Car({
        x: 0,
        y: canvas.height / 2 + laneOffset,
        dx: speed,
        dy: 0
    }));

    // Горизонтальные машины (справа налево)
    laneh.cars.push(new Car({
        x: canvas.width,
        y: canvas.height / 2 + laneOffsetRight,
        dx: -speed,
        dy: 0
    }));

    // Вертикальные машины (сверху вниз)
    lanev.cars.push(new Car({
        x: canvas.width / 2 + laneOffset,
        y: 0,
        dx: 0,
        dy: speed
    }));

    // Вертикальные машины (снизу вверх)
    lanev.cars.push(new Car({
        x: canvas.width / 2 + laneOffsetRight,
        y: canvas.height,
        dx: 0,
        dy: -speed
    }));
}, 2000);

(function animloop() {
    requestAnimationFrame(animloop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawIntersection();

    // Управление машинами
    laneh.cars.forEach(function (car) {
        if (car.isBeforeStopLine()) {
            if (horizontalTrafficLightState === 0) {
                car.stop();
            }
        } else if (!car.isBeforeStopLine()) {
            if (horizontalTrafficLightState === 2) {
                car.start()
            }
        }
        car.move();
        car.draw();
    });

    lanev.cars.forEach(function (car) {
        if (car.isBeforeStopLine()) {
            if (verticalTrafficLightState === 0) {
                car.stop();
            }
        } else if (!car.isBeforeStopLine()) {
            if (verticalTrafficLightState === 2) {
                car.start()
            }
        }
        car.move();
        car.draw();
    });

    // Удаление машин за пределами экрана
    laneh.cars = laneh.cars.filter(function (car) {
        return car.x < canvas.width;
    });

    lanev.cars = lanev.cars.filter(function (car) {
        return car.y < canvas.height;
    });
})();

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
setTimeout(changeTrafficLight, horizontalRedDuration);
