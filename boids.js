var SPEED = 2.0;
var NUM_BOIDS = 20;
var DELAY = 50;

var MIN_SEP_DIST = 15.0;

// Weightings of each factor.
var SEPARATION_WEIGHT = 1.0;
var ALIGNMENT_WEIGHT = 1.0;
var COHESION_WEIGHT = 0.10;
var PREDATOR_WEIGHT = 2.0;

// Canvas dimensions, set when the script first gets the canvas.
var SCREEN_WIDTH;
var SCREEN_HEIGHT;

function Boid(position, velocity) {
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
      var dx = boids[i].pos.x - boids[j].pos.x;
      dx = Math.min(dx, SCREEN_WIDTH - dx);
      var dy = boids[i].pos.y - boids[j].pos.y;
      dy = Math.min(dy, SCREEN_HEIGHT - dy);

      if (dx * dx + dy * dy < MIN_SEP_DIST * MIN_SEP_DIST) {
        dists[i].push(new Vector(dx, dy));
      }
    }
  }
  return dists;
}

function calcNewPositions(boids) {
  var dists = calcSeparations(boids);
  var meanHeading = calcMeanHeading(boids);
  var centerOfMass = calcCenterOfMass(boids);

  for (var i = 0; i < boids.length; ++i) {

    // Calculate the cohesion vector.
    var cx = centerOfMass.x - boids[i].pos.x;
    cx = Math.min(cx, SCREEN_WIDTH - cx);
    var cy = centerOfMass.y - boids[i].pos.y;
    cy = Math.min(cy, SCREEN_HEIGHT - cy);

    var cohesionVector = new Vector(cx, cy);
    cohesionVector.normalize();
    cohesionVector.scale(COHESION_WEIGHT);

    // Calculate the heading vector.
    var alignmentVector = new Vector(meanHeading.x - boids[i].vel.x, meanHeading.y - boids[i].vel.y);
    alignmentVector.normalize();
    alignmentVector.scale(ALIGNMENT_WEIGHT);

    // Calculate the separation vector. Currently all boids within the
    // separation radius are treated equally: is not a continuous function of
    // distance.
    var separationVector = new Vector(0, 0);
    for (var j = 0; j < dists[i].length; ++j) {
      separationVector.x += dists[i][j].x;
      separationVector.y += dists[i][j].y;
    }
    separationVector.normalize();
    separationVector.scale(SEPARATION_WEIGHT);

    // Put everything together in one vector.
    var changeVector = new Vector(cohesionVector.x + alignmentVector.x + separationVector.x,
        cohesionVector.y + alignmentVector.y + separationVector.y);
    cohesionVector.normalize();

    // Update the heading of this boid. The heading is the normalized sum of the
    // current velocity vector and the new velocity vector, such that the boid's
    // turning is fairly smooth.
    boids[i].vel.x += changeVector.x * SPEED;
    boids[i].vel.y += changeVector.y * SPEED;
    boids[i].vel.normalize();
    boids[i].vel.scale(SPEED);

    // Bound the boid such that it stays on the screen.
    boids[i].pos.x = (boids[i].pos.x + boids[i].vel.x) % SCREEN_WIDTH;
    boids[i].pos.y = (boids[i].pos.y + boids[i].vel.y) % SCREEN_HEIGHT;
    if (boids[i].pos.x < 0)
      boids[i].pos.x = SCREEN_WIDTH - boids[i].pos.x;
    if (boids[i].pos.y < 0)
      boids[i].pos.y = SCREEN_HEIGHT - boids[i].pos.y;
  }
}

function drawBoid(ctx, boid) {
  var angle = Math.atan2(boid.vel.y, boid.vel.x);
  ctx.beginPath();
  // I <3 magic numbers.
  ctx.moveTo(boid.pos.x + 6 * Math.cos(angle), boid.pos.y + 6 * Math.sin(angle));
  ctx.lineTo(boid.pos.x + 4 * Math.cos(angle + 2.094), boid.pos.y + 4 * Math.sin(angle + 2.094));
  ctx.lineTo(boid.pos.x + 4 * Math.cos(angle + 4.189), boid.pos.y + 4 * Math.sin(angle + 4.189));
  ctx.fill();
}

function draw(ctx, boids) {
  for (var i = 0; i < boids.length; ++i) {
    drawBoid(ctx, boids[i]);
  }
}

function initBoids(num, width, height) {
  var boids = [];
  for (var i = 0; i < num; ++i) {
    var x = Math.floor(Math.random() * width);
    var y = Math.floor(Math.random() * height);
    var vector = new Vector(Math.random(), Math.random());
    vector.normalize();
    vector.scale(SPEED);
    boids.push(new Boid(new Vector(x, y), vector));
  }
  return boids;
}

function loop(ctx, boids) {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  draw(ctx, boids);
  calcNewPositions(boids);
}

function main() {
  var canvas = document.getElementById('boidsCanvas');
  var ctx = canvas.getContext('2d');
  SCREEN_WIDTH = canvas.width;
  SCREEN_HEIGHT = canvas.height;
  boids = initBoids(NUM_BOIDS, canvas.width, canvas.height);
  setInterval(function() { loop(ctx, boids) }, DELAY);
}

main();
