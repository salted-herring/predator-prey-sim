var SPEED = 1.0;

var MIN_SEP_DIST = 5.0;

// Weightings of each factor.
var SEPARATION_WEIGHT = 1.0;
var ALIGNMENT_WEIGHT = 1.0;
var COHESION_WEIGHT = 1.0;
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
  for (boid in boids) {
    xTotal += boid.x;
    yTotal += boid.y;
  }
  return Vector(xTotal / boids.length, yTotal / boids.length);
}

function calcMeanHeading(boids) {
  var dxTotal = 0;
  var dyTotal = 0;
  for (boid in boids) {
    dxTotal += boid.dx;
    dyTotal += boid.dy;
  }
  return Vector(dxTotal, dyTotal);
}

function calcSeparations(boids) {
  var dists = [];
  for (var i = 0; i < boids.length; ++i) {
    dists.append([]);
    for (var j = 0; j < boids.length; ++j) {
      // Calculate such that resulting vector points away from the offending
      // neighbour.
      var dx = boids[i].x - boids[j].x;
      dx = min(dx, SCREEN_WIDTH - dx);
      var dy = boids[i].y - boids[j].y;
      dy = min(dy, SCREEN_HEIGHT - dy);
      if (dx * dx + dy * dy > MIN_SEP_DIST * MIN_SEP_DIST) {
        dists[i].append(Vector(dx, dy));
      }
    }
  }
  return dists;
}

function normalize(vector) {
  len = sqrt(vector.x * vector.x + vector.y * vector.y);
  vector.x /= len;
  vector.y /= len;
}

function calcNewPositions(boids) {
  var dists = calcSeparations(boids);
  var meanHeading = calcMeanHeaing(boids);
  var centerOfMass = calcCenterOfMass(boids);

  for (var i = 0; i < boids.length; ++i) {

    // Calculate the cohesion vector.
    var cohesionVector = Vector(centerOfMass.x - boids[i].x, centerOfMass.y - boids[i].y);
    normalize(cohesionVector);

    // Calculate the heading vector.
    var alignmentVector = Vector(meanHeading.x - boids[i].dx, meanHeading.y - boids[i].dy);
    normalize(alignmentVector);

    // Calculate the separation vector. Currently all boids within the
    // separation radius are treated equally: is not a continuous function of
    // distance.
    var separationVector = (0, 0);
    for (other in dists[i]) {
      var vector = Vector(boids[i].x - other.x, boids[i].y - other.y);
      normalize(vector);
      separationVector.x += vector.x;
      separationVector.y += vector.y;
    }
    normalize(separationVector);

    // Put everything together in one vector.
    var changeVector = Vector(COHESION_WEIGHT * cohesionVector.x + ALIGNMENT_WEIGHT * headingVector.x + SEPARATION_WEIGHT * separationVector.x, COHESION_WEIGHT * cohesionVector.y + ALIGNMENT_WEIGHT * headingVector.y + SEPARATION_WEIGHT * separationVector.y);
    normalize(changeVector);

    // Update the heading of this boid.
    boids[i].dx = changeVector.x * SPEED;
    boids[i].dy = changeVector.y * SPEED;

    boids[i].x = (boids[i].x + boids[i].dx) % SCREEN_WIDTH;
    boids[i].y = (boids[i].y + boids[i].dy) % SCREEN_HEIGHT;
  }
}

function main() {
  // Do stuff here!
  var canvas = document.getElementById('boidsCanvas');
  var ctx = canvas.getContext('2d');
}
