
const canvas = document.getElementById("trafficCanvas");
const ctx = canvas.getContext("2d");

// Настройки движения
const carRadius = 10;
const safteyDistance = carRadius + 5;
const carSpeed = 3;
const pushCarEveryNFrames = 30;

class Car {
    constructor(startPoint) {
        this.x = startPoint.x;
        this.y = startPoint.y;
        this.dx = startPoint.dx;
        this.dy = startPoint.dy;
        this.memdx = this.dx;
        this.memdy = this.dy;
        this.radius = carRadius;
        this.color = this.getCarColor();
    }

    getCarColor() {
        if (this.dx > 0) return '#FF0000'; // red right
        if (this.dx < 0) return '#00FF00'; // green left
        if (this.dy > 0) return '#0000FF'; // blue down
        return '#FFFF00'; // yellow up
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
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Lane {
    constructor(type, startPoints, semaphores) {
        this.type = type;
        this.upLaneStart = startPoints.up;
        this.downLaneStart = startPoints.down;
        this.upSem = semaphores.up;
        this.downSem = semaphores.down;
        this.upLaneCars = [];
        this.downLaneCars = [];
        this.counter = 0;
        
        this.setStopPositions();
    }

    setStopPositions() {
        if (this.type === 'vertical') {
            this.upStop = canvas.height/2 - safteyDistance;
            this.downStop = canvas.height/2 + safteyDistance;
        } else {
            this.upStop = canvas.width/2 + safteyDistance;
            this.downStop = canvas.width/2 - safteyDistance;
        }
    }

    check() {
        this.counter++;
        if (this.counter % pushCarEveryNFrames === 0) {
            this.addNewCars();
        }

        this.updateCars(this.upLaneCars, 'up');
        this.updateCars(this.downLaneCars, 'down');
    }

    addNewCars() {
        const lastUp = this.upLaneCars[this.upLaneCars.length - 1];
        if (!lastUp || this.getDistance(lastUp, this.upLaneStart) > 2*carRadius + safteyDistance) {
            this.upLaneCars.push(new Car(this.upLaneStart));
        }

        const lastDown = this.downLaneCars[this.downLaneCars.length - 1];
        if (!lastDown || this.getDistance(lastDown, this.downLaneStart) > 2*carRadius + safteyDistance) {
            this.downLaneCars.push(new Car(this.downLaneStart));
        }
    }

    getDistance(car, start) {
        return Math.sqrt((car.x - start.x)**2 + (car.y - start.y)**2);
    }

    updateCars(cars, direction) {
        for (let i = 0; i < cars.length; i++) {
            const car = cars[i];
            
            // Проверка светофора
            const semaphore = direction === 'up' ? this.upSem : this.downSem;
            if (semaphore.light < 2 && this.isAtStopLine(car, direction)) {
                car.stop();
            } else {
                car.start();
            }

            // Проверка дистанции
            if (i > 0) {
                const prev = cars[i-1];
                const dist = Math.sqrt((car.x - prev.x)**2 + (car.y - prev.y)**2);
                if (dist < 2*carRadius + safteyDistance) car.stop();
                else car.start();
            }

            car.move();
        }

        // Удаление машин за пределами холста
        this.cleanCars(cars);
    }

    isAtStopLine(car, direction) {
        if (this.type === 'vertical') {
            return direction === 'up' 
                ? car.y <= this.upStop 
                : car.y >= this.downStop;
        }
        return direction === 'up' 
            ? car.x >= this.upStop 
            : car.x <= this.downStop;
    }

    cleanCars(cars) {
        while (cars.length > 0 && this.isOutOfCanvas(cars[0])) {
            cars.shift();
        }
    }

    isOutOfCanvas(car) {
        return car.x < -carRadius || car.x > canvas.width + carRadius ||
               car.y < -carRadius || car.y > canvas.height + carRadius;
    }

    draw() {
        this.upLaneCars.forEach(car => car.draw());
        this.downLaneCars.forEach(car => car.draw());
    }
}

// Инициализация системы
let horizontalLane, verticalLane;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Настройки полос
    const roadWidth = Math.min(canvas.width, canvas.height) * 0.3;
    
    horizontalLane = new Lane('horizontal', {
        up: {x: canvas.width + carRadius, y: canvas.height/2 - safteyDistance, dx: -carSpeed, dy: 0},
        down: {x: -carRadius, y: canvas.height/2 + safteyDistance, dx: carSpeed, dy: 0}
    }, {
        up: {light: 0},
        down: {light: 0}
    });

    verticalLane = new Lane('vertical', {
        up: {x: canvas.width/2 - safteyDistance, y: -carRadius, dx: 0, dy: carSpeed},
        down: {x: canvas.width/2 + safteyDistance, y: canvas.height + carRadius, dx: 0, dy: -carSpeed}
    }, {
        up: {light: 0},
        down: {light: 0}
    });

    drawIntersection();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Обновление состояний светофоров
    horizontalLane.upSem.light = horizontalTrafficLightState;
    horizontalLane.downSem.light = horizontalTrafficLightState;
    verticalLane.upSem.light = verticalTrafficLightState;
    verticalLane.downSem.light = verticalTrafficLightState;

    horizontalLane.check();
    verticalLane.check();
    
    drawIntersection();
    horizontalLane.draw();
    verticalLane.draw();
    
    requestAnimationFrame(animate);
}

function drawIntersection() {
    const roadWidth = Math.min(canvas.width, canvas.height) * 0.3;
    ctx.fillStyle = "#2b2b2b";

    ctx.fillRect(0, canvas.height / 2 - roadWidth / 2, canvas.width, roadWidth);
    ctx.fillRect(canvas.width / 2 - roadWidth / 2, 0, roadWidth, canvas.height);

    drawRoadMarkings(roadWidth);
    drawTrafficLights(roadWidth);
}

function drawRoadMarkings(roadWidth) {
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

    ctx.setLineDash([]); // Убираем пунктирные линии для "уборки"
    ctx.strokeStyle = "#2b2b2b"; // Цвет фона (чтобы не рисовать полосы в центре)

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - roadWidth / 2, canvas.height / 2 - roadWidth / 2);
    ctx.lineTo(canvas.width / 2 + roadWidth / 2, canvas.height / 2 - roadWidth / 2);
    ctx.lineTo(canvas.width / 2 + roadWidth / 2, canvas.height / 2 + roadWidth / 2);
    ctx.lineTo(canvas.width / 2 - roadWidth / 2, canvas.height / 2 + roadWidth / 2);
    ctx.closePath();
    ctx.fill();
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

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
setTimeout(changeTrafficLight, horizontalRedDuration);
