/*
 * Prey
 *
 * Prey like to form flocks. They follow some basic rules:
 *   - Prey like to travel in the same direction as others.
 *   - Prey like to be close to the rest of their flock.
 *   - Prey try to avoid hitting others who are too close.
 *   - Prey flee from predators who get too close.
 */

/*
 * Prey constructor.
 *
 * @param position - The location of the prey.
 * @param velocity - The velocity of the prey.
 */
function Prey(position, velocity) {
  this.pos = position;
  this.vel = velocity;
}

/*
 * Creates a new prey in a random location on the screen.
 *
 * @param config - Configuration options.
 *
 * Returns a new prey in a random location.
 */
Prey.create = function(speed, bounds) {
  // Generate a random position for the prey.
  var x = Math.floor(Math.random() * bounds.x);
  var y = Math.floor(Math.random() * bounds.y);

  // Create a random velocity vector with the required speed.
  var vel = new Vector(Math.random(), Math.random());
  vel = vel.normalize().scale(speed);

  return new Prey(new Vector(x, y), vel);
}

/*
 * Finds the closest predator to this prey.
 *
 * @param predatorList - The list of predators.
 * @param config - Configuration options.
 *
 * Returns the closest predator, or null if no predators are within a notable
 * distance.
 */
Prey.prototype.findClosestPredator = function(predatorList, predatorSightDist,
    screen) {
  if (predatorList.length === 0) {
    return null;
  }

  var closestIndex = -1;
  var closestDist = screen.len2();
  var prey = this;

  predatorList.forEach(function(predator, index) {
    var dist = prey.pos.boundedDist(predator.pos, screen);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = index;
    }
  });

  // Check if the closest predator is actually within a distance that the prey
  // cares about.
  if (closestDist < predatorSightDist * predatorSightDist) {
    return predatorList[closestIndex];
  } else {
    return null;
  }
}

/*
 * Calculates the mean heading of the prey.
 * The mean heading is simply the average direction that the prey are heading.
 *
 * @param preyList - The list of prey.
 *
 * Returns a Vector representing the average heading.
 */
function calcMeanHeading(preyList) {
  var heading = new Vector(0, 0);
  preyList.forEach(function(prey) {
    heading = heading.add(prey.vel);
  });
  return heading.normalize();
}

function gaugeNeighbourDists(preyList, minSeparation, screen) {
  // Prey are difficult to satisfy: they want to be close to each
  // other in a flock, but not so close as to risk hitting each
  // other.
  var neighbourDists = {
    tooClose: [],
    tooFar: [],
    dist: []
  };

  preyList.forEach(function(prey, i, preyList) {
    neighbourDists.tooClose.push([]);
    neighbourDists.tooFar.push([]);
    neighbourDists.dist[i] = 0;

    preyList.forEach(function(neighbour, j) {
      // The prey shouldn't take itself into account.
      if (i === j) {
        return;
      }

      // Find the distance between the two prey.
      var dist = prey.pos.boundedDist(neighbour.pos, screen);
        neighbourDists.dist[i] += Math.sqrt(dist);

      // If the neighbour is within the minimum separation distance,
      // a vector pointing away from it is added to the 'tooClose' list.
      // Otherwise, the neighbour is too far and a vector pointing toward
      // it is added to the 'tooFar' list.
      if (dist < config.prey.minSeparation * config.prey.minSeparation) {
        var path = neighbour.pos.shortestBoundedPathTo(prey.pos, screen.x, screen.y);
        neighbourDists.tooClose[i].push(path.reverseLinearNormalize(0, minSeparation));
      } else {
        var path = prey.pos.shortestBoundedPathTo(neighbour.pos, screen.x, screen.y);
        neighbourDists.tooFar[i].push(path.normalize());
      }
    });
    neighbourDists.dist[i] /= preyList.length;
  });
  return neighbourDists;
}

Prey.prototype.move = function(predators, maxTurnAngle, predatorSightDist,
    tooFar, meanHeading, tooClose, dist, minFlockDist, screen, weights) {

  // Calculate the cohesion vector.
  var cohesionVector = new Vector(0, 0);
  if (dist > minFlockDist) {
    tooFar.forEach(function(path) {
      cohesionVector = cohesionVector.add(path);
    });
    cohesionVector = cohesionVector.normalize().scale(weights.cohesion);
  }

  // Calculate the heading vector.
  var alignmentVector = meanHeading.normalize().scale(weights.alignment);

  // Calculate the separation vector. Currently all prey  within the
  // separation radius are treated equally: is not a continuous function of
  // distance.
  var separationVector = new Vector(0, 0);
  tooClose.forEach(function(path) {
    separationVector = separationVector.add(path);
  });
  separationVector = separationVector.normalize().scale(weights.separation);

  // Find the closest predator. If the closest predator is within a certain
  // range, the prey wants to escape.
  var closestPredator = this.findClosestPredator(predators, predatorSightDist,
      screen);
  var closestPredatorVector = new Vector(0, 0);

  if (closestPredator) {
    // Create a vector pointing away from the predator.
    closestPredatorVector = closestPredator.pos.shortestBoundedPathTo(this.pos,
        screen.x, screen.y);

    // Scale the weighting linearly as a function of length.
    closesetPreadatorVector = closestPredatorVector
        .reverseLinearNormalize(0, predatorSightDist).scale(weights.flee);
  }

  // Put everything together in one vector.
  var changeVector = cohesionVector.add(alignmentVector).add(separationVector)
      .add(closestPredatorVector).normalize();

  // Update the velocity of the prey.
  var turnAngle = turn(this.vel, changeVector, maxTurnAngle);
  this.vel = new Vector(Math.cos(turnAngle), Math.sin(turnAngle));
  this.vel = this.vel.scale(config.prey.speed);

  // Update the prey's position and bound it so that it stays on the screen.
  this.pos = this.pos.add(this.vel).bound(screen);
}

/*
 * Draws a prey.
 *
 * @ctx - The graphics context with which to draw.
 */
Prey.prototype.draw = function(ctx, color) {
  ctx.fillStyle = color;
  drawTriangle(ctx, this.pos.x, this.pos.y, 6, 4, this.vel.angle());
}
