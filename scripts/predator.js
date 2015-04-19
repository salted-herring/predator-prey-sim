/*
 * Copyright (c) 2015 Adam Heins
 *
 * This file is part of the Predator Prey Simulation project, which is
 * distributed under the MIT license. For the full terms, see the included
 * LICENSE file.
 *
 *
 * Predators hunt prey. Predators really only follow a single rule:
 *    - Chase (and kill, if opportunity presents itself), the closest prey.
 */

/*
 * Predator constructor.
 *
 * @param position - The initial position of the predator.
 * @param velocity - The initial velocity of the predator.
 */
function Predator(position, velocity) {
  this.pos = position;
  this.vel = velocity;
}

/*
 * Creates a new predator in a random location on the screen.
 *
 * @param speed - The speed of the predator.
 * @param bounds - The upper bounds within which the prey are to be generated.
 *
 * Returns a new predator in a random location.
 */
Predator.create = function(speed, bounds) {
  var x = Math.floor(Math.random() * bounds.x);
  var y = Math.floor(Math.random() * bounds.y);
  var vel = new Vector(Math.random(), Math.random());
  vel = vel.normalize().scale(speed);
  return new Predator(new Vector(x, y), vel);
}

/*
 * Finds the closest prey to this predator.
 *
 * @param preyList - The list of prey.
 * @param screen - A vector representing the screen dimensions.
 *
 * Returns the index of the closest prey.
 */
Predator.prototype.findClosestPrey = function(preyList, screen) {
  if (preyList.length === 0) {
    return null;
  }

  var closestIndex = null;
  var closestDist = screen.len2();
  var predator = this;

  preyList.forEach(function(prey, index) {
    var dist = predator.pos.boundedDist(prey.pos, screen);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = index;
    }
  });
  return closestIndex;
}

/*
 * Moves the predator. The predator simply seeks the closest prey.
 *
 * @param preyList - The list of prey available.
 * @param speed - The speed of the predator.
 * @param maxTurnAngle - The maximum turn angle of the predator.
 * @param killDist - The distance within which a predator must be of a prey
 *     to kill the prey.
 * @param ctx - The graphics context.
 * @param screen - A vector representing the screen dimensions.
 */
Predator.prototype.move = function(preyList, speed, maxTurnAngle, killDist,
    ctx, screen) {

  // If there are no prey left. just keep moving aimlessy.
  if (preyList.length === 0) {
    this.pos = this.pos.add(this.vel).bound(screen);
    return;
  }

  var closestPreyIndex = this.findClosestPrey(preyList, screen);
  var target = preyList[closestPreyIndex];

  // Find the shortest path to the target prey.
  var movementVector = this.pos.shortestBoundedPathTo(target.pos, screen.x,
      screen.y);

  // Draw a line from this predator to targeted prey.
  drawLine(ctx, this.pos, target.pos, '#aaa');

  // Calculate the new velocity of the predator.
  var turnAngle = turn(this.vel, movementVector, maxTurnAngle);
  this.vel = new Vector(Math.cos(turnAngle), Math.sin(turnAngle));
  this.vel = this.vel.scale(speed);

  // Update the predator's position and bound it so that it stays on the
  // screen.
  this.pos = this.pos.add(this.vel).bound(screen);

  // Kill the prey if is has been caught by the predator.
  if (this.pos.boundedDist(target.pos, screen) < killDist * killDist) {
    preyList.splice(closestPreyIndex, 1);
  }
}

/*
 * Draws a predator.
 *
 * @param ctx - The graphics context with which to draw.
 * @param color - The color with which to draw the predator.
 */
Predator.prototype.draw = function(ctx, color) {
  drawTriangle(ctx, this.pos.x, this.pos.y, 12, 8, this.vel.angle(), color);
}
