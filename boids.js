var config = {
  weights : {
    separation: 1.0,
    alignment: 1.0,
    cohesion: 1.0,
    flee: 5.0
  },
  prey: {
    speed: 2.0,
    number: 20,
    maxTurnAngle: 0.5,
    minSeparation: 15.0,
    predatorSightDist: 200
  },
  predator: {
    speed: 2.0,
    number: 2,
    killDist: 6.0,
    maxTurnAngle: 0.2
  },
  env: {
    delay: 50
  }
};

function absMin(a, b) {
  return Math.abs(a) < Math.abs(b) ? a : b;
}

function Boid(position, velocity) {
  this.pos = position;
  this.vel = velocity;
}

function Predator(position, velocity) {
  this.pos = position;
  this.vel = velocity;
}

function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.normalize = function() {
  len = Math.sqrt(this.x * this.x + this.y * this.y);
  if (len == 0)
    return;
  this.x /= len;
  this.y /= len;
}

Vector.prototype.scale = function(scalar) {
  this.x *= scalar;
  this.y *= scalar;
}

/* Calculates the distance between this vector and another. */
Vector.prototype.dist = function(other) {
  var dx = other.x - this.x;
  var dy = other.y - this.y;
  return dx * dx + dy * dy;
}

/*
 * Subtracts the @other vector from this one.
 *
 * @other - The vector being subtracted from this one.
 *
 * Returns a new vector that is the difference between this one and @other.
 */
Vector.prototype.subtract = function(other) {
  return new Vector(this.x - other.x, this.y - other.y);
}

Vector.prototype.add = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
}

Vector.prototype.bound = function(xU, yU) {
  var bounded = new Vector(this.x % xU, this.y % yU);
  if (bounded.x < 0) {
    bounded.x = xU + bounded.x;
  }
  if (bounded.y < 0) {
    bounded.y = yU + bounded.y;
  }
  return bounded;
}

Vector.prototype.len = function() {
  return Math.sqrt(this.len2());
}

Vector.prototype.len2 = function() {
  return this.x * this.x + this.y * this.y;
}

Vector.prototype.dot = function(other) {
  return this.x * other.x + this.y * other.y;
}

Vector.prototype.angle = function() {
  return Math.atan2(this.y, this.x);
}

function calcCenterOfMass(boids) {
  var centerOfMass = new Vector(0, 0);
  for (var i = 0; i < boids.length; ++i) {
    centerOfMass.x += boids[i].pos.x;
    centerOfMass.y += boids[i].pos.y;
  }
  centerOfMass.scale(1 / boids.length);
  return centerOfMass;
}

function calcMeanHeading(boids) {
  var dxTotal = 0;
  var dyTotal = 0;
  for (var i = 0; i < boids.length; ++i) {
    dxTotal += boids[i].vel.x;
    dyTotal += boids[i].vel.y;
  }
  return new Vector(dxTotal, dyTotal);
}

function calcSeparations(boids) {
  var dists = [];
  for (var i = 0; i < boids.length; ++i) {
    dists.push([]);
    for (var j = 0; j < boids.length; ++j) {

      // A boid shouldn't try to avoid itself.
      if (i === j)
        continue;

      // Calculate such that resulting vector points away from the offending
      // neighbour.
      var dx = boids[i].pos.x - boids[j].pos.x; // TODO broken logic
      dx = absMin(dx, config.env.screenWidth - Math.abs(dx));
      var dy = boids[i].pos.y - boids[j].pos.y;
      dy = absMin(dy, config.env.screenHeight - Math.abs(dy));

      if (dx * dx + dy * dy < config.prey.minSeparation * config.prey.minSeparation) {
        dists[i].push(new Vector(dx, dy));
      }
    }
  }
  return dists;
}

Boid.prototype.findClosestPredator = function(predators) {
  if (predators.length === 0) {
    return -1;
  }
  var closestIndex = 0;
  var closestDist = this.pos.dist(predators[0].pos);
  for (var i = 1; i < predators.length; ++i) {
    var dx = Math.abs(this.pos.x - predators[i].pos.x);
    dx = Math.min(dx, config.env.screenWidth - dx);
    var dy = Math.abs(this.pos.y - predators[i].pos.y);
    dx = Math.min(dy, config.env.screenHeight - dy);
    var dist = dx * dx + dy * dy;

    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  }
  if (closestDist < config.prey.predatorSightDist * config.prey.predatorSightDist) {
    return closestIndex;
  } else {
    return -1;
  }
}

Predator.prototype.findClosestPrey = function(boids) {
  var closestIndex = 0;
  var closestDist = this.pos.dist(boids[0].pos);
  for (var i = 1; i < boids.length; ++i) {
    var dx = Math.abs(this.pos.x - boids[i].pos.x);
    dx = Math.min(dx, config.env.screenWidth - dx);
    var dy = Math.abs(this.pos.y - boids[i].pos.y);
    dy = Math.min(dy, config.env.screenHeight - dy);
    var dist = dx * dx + dy * dy;

    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  }
  return closestIndex;
}

Predator.prototype.move = function(boids) {
  var closestPreyIndex = this.findClosestPrey(boids);
  var movementVector = boids[closestPreyIndex].pos.subtract(this.pos);

  // Draw a line from this predator to targeted prey.
  var ctx = config.env.ctx;
  ctx.beginPath();
  ctx.moveTo(this.pos.x, this.pos.y);
  ctx.lineTo(boids[closestPreyIndex].pos.x, boids[closestPreyIndex].pos.y);
  ctx.stroke();

  var angle = this.vel.angle();
  var dAngle = movementVector.angle() - angle;

  // Ensure turn angle does not exceed the max allowed value.
  if (Math.abs(dAngle) > config.predator.maxTurnAngle) {
    dAngle %= config.predator.maxTurnAngle;
  }

  angle += dAngle;
  this.vel = new Vector(Math.cos(angle), Math.sin(angle));
  this.vel.scale(config.predator.speed);

  // Bound the predator so that it stays on the screen.
  this.pos = this.pos.add(this.vel).bound(config.env.screenWidth, config.env.screenHeight);

  // Kill the prey if is has been caught by the predator.
  if (this.pos.dist(boids[closestPreyIndex].pos) < config.predator.killDist * config.predator.killDist) {
    boids.splice(closestPreyIndex, 1);
    --config.prey.number;
  }
}

function movePredators(predators, boids) {
  for (var i = 0; i < predators.length; ++i) {
    predators[i].move(boids);
  }
}


function calcNewPositions(boids, predators) {
  var dists = calcSeparations(boids);
  var meanHeading = calcMeanHeading(boids);
  var centerOfMass = calcCenterOfMass(boids);

  for (var i = 0; i < boids.length; ++i) {

    // Calculate the cohesion vector.
    var cx = centerOfMass.x - boids[i].pos.x;
    cx = absMin(cx, config.env.screenWidth - Math.abs(cx));
    var cy = centerOfMass.y - boids[i].pos.y;
    cy = absMin(cy, config.env.screenHeight - Math.abs(cy));

    var cohesionVector = new Vector(cx, cy);
    cohesionVector.normalize();
    cohesionVector.scale(config.weights.cohesion);

    // Calculate the heading vector.
    var alignmentVector = new Vector(meanHeading.x - boids[i].vel.x, meanHeading.y - boids[i].vel.y);
    alignmentVector.normalize();
    alignmentVector.scale(config.weights.alignment);

    // Calculate the separation vector. Currently all boids within the
    // separation radius are treated equally: is not a continuous function of
    // distance.
    var separationVector = new Vector(0, 0);
    for (var j = 0; j < dists[i].length; ++j) {
      separationVector.x += dists[i][j].x;
      separationVector.y += dists[i][j].y;
    }
    separationVector.normalize();
    separationVector.scale(config.weights.separation);

    // Find the closest predator. If the closest predator is within a certain
    // range, the boid wants to escape.
    var closestPredatorIndex = boids[i].findClosestPredator(predators);
    var closestPredatorVector = new Vector(0, 0);

    // Check if the closest predator is within range to be noticed.
    if (closestPredatorIndex !== -1) {
      // Create a vector pointing away from the predator.
      var closestPredator = predators[closestPredatorIndex];
      closestPredatorVector = boids[i].pos.subtract(closestPredator.pos);

      // Scale the weighting linearly as a function of length.
      var pDist = closestPredatorVector.len2();
      var nFactor = pDist / (config.prey.predatorSightDist * config.prey.predatorSightDist);
      var sFactor = 1 - nFactor;
      closestPredatorVector.normalize();
      closestPredatorVector.scale(config.weights.flee * sFactor);
    }

    // Put everything together in one vector.
    var changeVector = new Vector(cohesionVector.x + alignmentVector.x + separationVector.x
        + closestPredatorVector.x, cohesionVector.y + alignmentVector.y + separationVector.y,
        + closestPredatorVector.y);
    changeVector.normalize();

    var angle = boids[i].vel.angle();
    var dAngle = changeVector.angle() - angle;

    // Ensure turn angle does not exceed the max allowed value.
    if (Math.abs(dAngle) > config.prey.maxTurnAngle) {
      dAngle %= config.prey.maxTurnAngle;
    }

    angle += dAngle;
    boids[i].vel = new Vector(Math.cos(angle), Math.sin(angle));
    boids[i].vel.scale(config.prey.speed);

    // Bound the boid so that it stays on the screen.
    boids[i].pos = boids[i].pos.add(boids[i].vel).bound(config.env.screenWidth, config.env.screenHeight);
  }
}

/* Draws a triangle centered on x and y and aimed toward angle. */
function drawTriangle(ctx, x, y, distForward, distBackward, angle) {
  ctx.beginPath();
  ctx.moveTo(x + distForward * Math.cos(angle),
      y + distForward * Math.sin(angle));
  ctx.lineTo(x + distBackward * Math.cos(angle + 2.094),
      y + distBackward * Math.sin(angle + 2.094));
  ctx.lineTo(x + distBackward * Math.cos(angle + 4.189),
      y + distBackward * Math.sin(angle + 4.189));
  ctx.fill();
}

Boid.create = function(screenWidth, screenHeight) {
  var x = Math.floor(Math.random() * screenWidth);
  var y = Math.floor(Math.random() * screenHeight);
  var vel = new Vector(Math.random(), Math.random());
  vel.normalize();
  vel.scale(config.prey.speed);
  return new Boid(new Vector(x, y), vel);
}

Predator.create = function(screenWidth, screenHeight) {
  var x = Math.floor(Math.random() * screenWidth);
  var y = Math.floor(Math.random() * screenHeight);
  var vel = new Vector(Math.random(), Math.random());
  vel.normalize();
  vel.scale(config.predator.speed);
  return new Predator(new Vector(x, y), vel);
}

/*
 * Initialize the arrays of prey and predators.
 */
function init(screenWidth, screenHeight) {
  var prey = [];
  var predators = [];
  for (var i = 0; i < config.prey.number; ++i) {
    prey.push(Boid.create(screenWidth, screenHeight));
  }
  for (var i = 0; i < config.predator.number; ++i) {
    predators.push(Predator.create(screenWidth, screenHeight));
  }
  return {
    prey: prey,
    predators: predators
  };
}

/*
 * Draws a prey.
 *
 * @ctx - The graphics context with which to draw.
 */
Boid.prototype.draw = function(ctx) {
  var angle = Math.atan2(this.vel.y, this.vel.x);
  ctx.fillStyle = "black";
  drawTriangle(ctx, this.pos.x, this.pos.y, 6, 4, angle);
}

/*
 * Draws a predator.
 *
 * @ctx - The graphics context with which to draw.
 */
Predator.prototype.draw = function(ctx) {
  var angle = Math.atan2(this.vel.y, this.vel.x);
  ctx.fillStyle = "red";
  drawTriangle(ctx, this.pos.x, this.pos.y, 12, 8, angle);
}

/*
 * Renders all of the creatures in the simulation.
 *
 * @ctx - The graphics context with which to draw.
 * @boids - The array of boids.
 * @predators - The array of predators.
 */
function render(ctx, boids, predators) {
  ctx.clearRect(0, 0, config.env.screenWidth, config.env.screenHeight);
  boids.forEach(function(boid) {
    boid.draw(ctx);
  });
  predators.forEach(function(predator) {
    predator.draw(ctx);
  });
}

/*
 * Moves all of the creatures in the simulation.
 *
 * @boids - The array of prey.
 * @predators - The array of predators.
 */
function move(boids, predators) {
  movePredators(predators, boids);
  calcNewPositions(boids, predators);
}

/*
 * Main program loop.
 *
 * @ctx - The graphics context with which to draw.
 * @boids - The array of prey.
 * @predators - The array of predators.
 */
function loop(ctx, boids, predators) {
  render(ctx, boids, predators);
  move(boids, predators);
}

/*
 * Entry point of the program.
 */
function main() {
  var canvas = document.getElementById('boidsCanvas');
  var ctx = canvas.getContext('2d');

  config.env.screenWidth = canvas.width;
  config.env.screenHeight = canvas.height;
  config.env.ctx = ctx;

  var creatures = init(config.env.screenWidth, config.env.screenHeight);
  setInterval(function() {
    loop(ctx, creatures.prey, creatures.predators)
  }, config.env.delay);
}

main();
