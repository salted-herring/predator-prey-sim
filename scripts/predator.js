
function Predator(position, velocity) {
  this.pos = position;
  this.vel = velocity;
}

Predator.create = function(screenWidth, screenHeight) {
  var x = Math.floor(Math.random() * screenWidth);
  var y = Math.floor(Math.random() * screenHeight);
  var vel = new Vector(Math.random(), Math.random());
  vel = vel.normalize().scale(config.predator.speed);
  return new Predator(new Vector(x, y), vel);
}

Predator.prototype.findClosestPrey = function(preyList, config) {
  if (preyList.length === 0) {
    return -1;
  }

  var closestIndex = -1;
  var closestDist = config.env.screen.len2();
  var predator = this;
  preyList.forEach(function(prey, index) {
    var dist = predator.pos.boundedDist(prey.pos, config.env.screen.x, config.env.screen.y);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = index;
    }
  });
  return closestIndex;
}


Predator.prototype.move = function(boids, config) {
  // If there are no prey left. just keep moving aimlessy.
  if (boids.length === 0) {
    this.pos = this.pos.add(this.vel).bound(config.env.screen);
    return;
  }

  var closestPreyIndex = this.findClosestPrey(boids, config);
  var target = boids[closestPreyIndex];

  // Find the shortest path to the target prey.
  var movementVector = this.pos.shortestBoundedPathTo(
      target.pos,
      config.env.screen.x, config.env.screen.y);

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
  this.vel = this.vel.scale(config.predator.speed);

  // Bound the predator so that it stays on the screen.
  this.pos = this.pos.add(this.vel).bound(config.env.screen);

  // Kill the prey if is has been caught by the predator.
  if (this.pos.boundedDist(target.pos, config.env.screen.x, config.env.screen.y) < config.predator.killDist * config.predator.killDist) {
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
