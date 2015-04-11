
function Boid(position, velocity) {
  this.pos = position;
  this.vel = velocity;
}

Boid.create = function(screenWidth, screenHeight) {
  var x = Math.floor(Math.random() * screenWidth);
  var y = Math.floor(Math.random() * screenHeight);
  var vel = new Vector(Math.random(), Math.random());
  vel.normalize();
  vel.scale(config.prey.speed);
  return new Boid(new Vector(x, y), vel);
}

Boid.prototype.findClosestPredator = function(predators, config) {

  if (predators.length === 0) {
    return -1;
  }

  var closestIndex = -1;
  var closestDist = config.env.screen.len2();
  var prey = this;

  predatorList.forEach(function(predator, index) {
    var dist = prey.pos.boundedDist(predator.pos, config.env.screen.x, config.env.screen.y);
    if (dist < closetDist) {
      closestDist = dist;
      closestIndex = index;
    }
  });

  // Check if the closest predator is actually within a distance that the prey
  // cares about.
  if (closestDist < config.prey.predatorSightDist * config.prey.predatorSightDist) {
    return closestIndex;
  } else {
    return -1;
  }
}

Boid.prototype.move = function(predators, centerOfMass, meanHeading, dists, config) {

  // Calculate the cohesion vector.
  var cx = centerOfMass.x - this.pos.x;
  cx = absMin(cx, config.env.screen.x - Math.abs(cx));
  var cy = centerOfMass.y - this.pos.y;
  cy = absMin(cy, config.env.screen.y - Math.abs(cy));

  var cohesionVector = new Vector(cx, cy);
  cohesionVector.normalize();
  cohesionVector.scale(config.weights.cohesion);

  // Calculate the heading vector.
  var alignmentVector = new Vector(meanHeading.x - this.vel.x,
      meanHeading.y - this.vel.y);
  alignmentVector.normalize();
  alignmentVector.scale(config.weights.alignment);

  // Calculate the separation vector. Currently all boids within the
  // separation radius are treated equally: is not a continuous function of
  // distance.
  var separationVector = new Vector(0, 0);
  dists.forEach(function(value) {
    separationVector = separationVector.add(value);
  });
  separationVector.normalize();
  separationVector.scale(config.weights.separation);

  // Find the closest predator. If the closest predator is within a certain
  // range, the boid wants to escape.
  var closestPredatorIndex = this.findClosestPredator(predators);
  var closestPredatorVector = new Vector(0, 0);

  // Check if the closest predator is within range to be noticed.
  if (closestPredatorIndex !== -1) {
    // Create a vector pointing away from the predator.
    var closestPredator = predators[closestPredatorIndex];
    closestPredatorVector = this.pos.subtract(closestPredator.pos);

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

  var angle = this.vel.angle();
  var dAngle = changeVector.angle() - angle;

  // Ensure turn angle does not exceed the max allowed value.
  if (Math.abs(dAngle) > config.prey.maxTurnAngle) {
    dAngle %= config.prey.maxTurnAngle;
  }

  angle += dAngle;
  this.vel = new Vector(Math.cos(angle), Math.sin(angle));
  this.vel.scale(config.prey.speed);

  // Bound the boid so that it stays on the screen.
  this.pos = this.pos.add(this.vel).bound(config.env.screen.x, config.env.screen.y);
}

/*
 * Draws a prey.
 *
 * @ctx - The graphics context with which to draw.
 */
Boid.prototype.draw = function(ctx) {
  ctx.fillStyle = "black";
  drawTriangle(ctx, this.pos.x, this.pos.y, 6, 4, this.vel.angle());
}
