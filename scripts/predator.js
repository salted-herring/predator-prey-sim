
function Predator(position, velocity) {
  this.pos = position;
  this.vel = velocity;
}

Predator.create = function(screenWidth, screenHeight) {
  var x = Math.floor(Math.random() * screenWidth);
  var y = Math.floor(Math.random() * screenHeight);
  var vel = new Vector(Math.random(), Math.random());
  vel.normalize();
  vel.scale(config.predator.speed);
  return new Predator(new Vector(x, y), vel);
}

Predator.prototype.findClosestPrey = function(prey) {
  if (preyList.length === 0) {
    return -1;
  }

  var closestIndex = -1;
  var closestDist = config.env.screen.len2();
  var predator = this;
  prey.forEach(function(boid, index) {
    var dist = predator.pos.boundedDist(boid.pos, config.env.screenWidth, config.env.screenHeight);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = index;
    }
  });
  return closestIndex;
}


Predator.prototype.move = function(boids) {
  var closestPreyIndex = this.findClosestPrey(boids);
  var target = boids[closestPreyIndex];
  var movementVector = target.pos.subtract(this.pos);
  if (movementVector.x < 0) {
    movementVector.x = absMin(movementVector.x, movementVector.x + 500);
  } else {
    movementVector.x = absMin(movementVector.x, movementVector.x - 500);
  }
  if (movementVector.y < 0) {
    movementVector.y = absMin(movementVector.y, movementVector.y + 500);
  } else {
    movementVector.y = absMin(movementVector.y, movementVector.y - 500);
  }

  // Draw a line from this predator to targeted prey.
  config.env.ctx.strokeStyle="#aaa";
  drawLine(config.env.ctx, this.pos, target.pos);

  var vAngle = this.vel.angle();
  var mAngle = movementVector.angle();

  // Get the absolute difference in angle.
  var dAngle = diffAngle(mAngle, vAngle);

  // Ensure turn angle does not exceed the max allowed value.
  dAngle = Math.min(dAngle, config.predator.maxTurnAngle);

  if (diffAngle(vAngle + dAngle, mAngle) > diffAngle(vAngle - dAngle, mAngle)) {
    vAngle -= dAngle;
  } else {
    vAngle += dAngle;
  }

  this.vel = new Vector(Math.cos(vAngle), Math.sin(vAngle));
  this.vel.scale(config.predator.speed);

  // Bound the predator so that it stays on the screen.
  this.pos = this.pos.add(this.vel).bound(config.env.screenWidth, config.env.screenHeight);

  // Kill the prey if is has been caught by the predator.
  if (this.pos.dist(target.pos) < config.predator.killDist * config.predator.killDist) {
    boids.splice(closestPreyIndex, 1);
    --config.prey.number;
  }
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
