var SPEED = 2.0;
var NUM_BOIDS = 20;
var DELAY = 50;

var MIN_SEP_DIST = 15.0;

// Weightings of each factor.
var SEPARATION_WEIGHT = 1.0;
var ALIGNMENT_WEIGHT = 1.0;
var COHESION_WEIGHT = 0.10;
var PREDATOR_WEIGHT = 2.0;

function Boid(x, y, dx, dy) {
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
}

function Vector(x, y) {
  this.x = x;
  this.y = y;
}

function calcCenterOfMass(boids) {
  var xTotal = 0;
  var yTotal = 0;
  for (var i = 0; i < boids.length; ++i) {
    xTotal += boids[i].x;
    yTotal += boids[i].y;
  }
  return new Vector(xTotal / boids.length, yTotal / boids.length);
}

function calcMeanHeading(boids) {
  var dxTotal = 0;
  var dyTotal = 0;
  for (var i = 0; i < boids.length; ++i) {
    dxTotal += boids[i].dx;
    dyTotal += boids[i].dy;
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
      var dx = boids[i].x - boids[j].x;
      dx = Math.min(dx, SCREEN_WIDTH - dx);
      var dy = boids[i].y - boids[j].y;
      dy = Math.min(dy, SCREEN_HEIGHT - dy);

      if (dx * dx + dy * dy < MIN_SEP_DIST * MIN_SEP_DIST) {
        dists[i].push(new Vector(dx, dy));
      }
    }
  }
  return dists;
}

function normalize(vector) {
  len = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (len == 0)
    return;
  vector.x /= len;
  vector.y /= len;
}

function calcNewPositions(boids) {
  var dists = calcSeparations(boids);
  var meanHeading = calcMeanHeading(boids);
  var centerOfMass = calcCenterOfMass(boids);

  for (var i = 0; i < boids.length; ++i) {

    // Calculate the cohesion vector.
    var cx = centerOfMass.x - boids[i].x;
    cx = Math.min(cx, SCREEN_WIDTH - cx);
    var cy = centerOfMass.y - boids[i].y;
    cy = Math.min(cy, SCREEN_HEIGHT - cy);
    var cohesionVector = new Vector(centerOfMass.x - boids[i].x, centerOfMass.y - boids[i].y);
    normalize(cohesionVector);

    // Calculate the heading vector.
    var alignmentVector = new Vector(meanHeading.x - boids[i].dx, meanHeading.y - boids[i].dy);
    normalize(alignmentVector);

    // Calculate the separation vector. Currently all boids within the
    // separation radius are treated equally: is not a continuous function of
    // distance.
    var separationVector = new Vector(0, 0);
    for (var j = 0; j < dists[i].length; ++j) {
      separationVector.x += dists[i][j].x;
      separationVector.y += dists[i][j].y;
    }
    normalize(separationVector);

    // Put everything together in one vector.
    var changeVector = new Vector(COHESION_WEIGHT * cohesionVector.x + ALIGNMENT_WEIGHT * alignmentVector.x + SEPARATION_WEIGHT * separationVector.x, COHESION_WEIGHT * cohesionVector.y + ALIGNMENT_WEIGHT * alignmentVector.y + SEPARATION_WEIGHT * separationVector.y);
    normalize(changeVector);

    // Update the heading of this boid.
    boids[i].dx = changeVector.x * SPEED;
    boids[i].dy = changeVector.y * SPEED;

    // Bound the boid such that it stays on the screen.
    boids[i].x = (boids[i].x + boids[i].dx) % SCREEN_WIDTH;
    boids[i].y = (boids[i].y + boids[i].dy) % SCREEN_HEIGHT;
    if (boids[i].x < 0)
      boids[i].x = SCREEN_WIDTH - boids[i].x;
    if (boids[i].y < 0)
      boids[i].y = SCREEN_HEIGHT - boids[i].y;
  }
}

function drawBoid(ctx, boid) {
  var angle = Math.atan2(boid.dy, boid.dx);
  ctx.beginPath();
  ctx.moveTo(boid.x + 6 * Math.cos(angle), boid.y + 6 * Math.sin(angle));
  ctx.lineTo(boid.x + 4 * Math.cos(angle + 2.094), boid.y + 4 * Math.sin(angle + 2.094));
  ctx.lineTo(boid.x + 4 * Math.cos(angle + 4.189), boid.y + 4 * Math.sin(angle + 4.189));
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
    normalize(vector);
    boids.push(new Boid(x, y, vector.x * SPEED, vector.y * SPEED));
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
