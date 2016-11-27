
const launch = (() => {

return function* launch(
            fuelConsumption,
            maxAltitude = 226000,
            defaultDeltaTime = .01,
            gasVelocity = 3173,
            rocketMass = 270000,
            minMass = 2000,
            maxVelocity = Infinity/*7900*/,
            maxAcc = Infinity/*12*/,
            maxTime = 600
        ) {
    
    let state = {
        mass: rocketMass,
        position: { x: 0, y: 0 },
        velocity: { vx: 0, vy: 0 },
        acceleration: 0,
        time: 0
    };
    
    let deltaTime = yield state || defaultDeltaTime;
    
    while ((maxTime -= deltaTime) > 0 && stillFlying()) {
        state = Object.assign(calculateNext(
            state.mass,
            state.position,
            state.velocity,
            deltaTime,
            fuelConsumption,
            gasVelocity
        ), {
            time: state.time + deltaTime
        });
        
        deltaTime = yield state || defaultDeltaTime;
    }
    
    function stillFlying() {
        const { vx, vy } = state.velocity;
        return state.mass > minMass
            && vx * vx + vy * vy < maxVelocity * maxVelocity
            && state.acceleration < maxAcc
            && state.position.y < maxAltitude;
    }
}

const earthRad = 6371000;
const g = altitude => 9.83 * Math.pow(earthRad / (earthRad + altitude), 2); // m/s^2

function calculateNext(
            currMass,
            { x: currX, y: currY },
            { vx: currVx, vy: currVy },
            deltaTime,
            fuelConsumption,
            gasVelocity
        ) {
    
    const sideAcc = -g(currY);
    const fcValue = fuelConsumption(currY);
    const mass = currMass - deltaTime * fcValue;
    const a = (fcValue * gasVelocity / mass) + sideAcc;
    
    // ax^2 + ay^2 = a^2
    // vx / vy = dx / dy = c
    // ax = c ay + (c vy0 - vx0) / dt = c ay + b
    
    const [dx, dy] = getVelVector(currY);
    const c = dx / dy;
    const b = (c * currVy - currVx) / deltaTime;
    
    const ay = (- 2 * b * c + Math.sqrt(4 * b * b * c * c - 4 * (b * b - a * a) * (c * c + 1))) / (2 * (c * c + 1));
    const ax = c * ay + b;
    
    // console.log(a, [ax, ay], [b, c], [dx, dy], deltaTime);
    
    const vx = currVx + ax * deltaTime;
    const vy = currVy + ay * deltaTime;
    
    const x = currX + vx * deltaTime;
    const y = currY + vy * deltaTime;
    
    return {
        mass,
        position: { x, y },
        velocity: { vx, vy },
        acceleration: a
    };
}

const c = 1 / 200000;
const a = 1 / .55;
const b = 100000;

function tan(y) {
    return Math.tan(Math.pow(y * c, a));
}

function tanDer(y) {
    return a * c * (1 + Math.pow(tan(y), 2)) * Math.pow(y * c, a - 1);
}

function getDownRange(y) {
    return b * tan(y);
}

function getVelVector(y) {
    const der = b * tanDer(y);
    const abs = Math.sqrt(der * der + 1);
    return [der / abs, 1 / abs];
}

})();
