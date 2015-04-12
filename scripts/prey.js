
function Boid(position, velocity) {
  this.pos = position;
  this.vel = velocity;
}

Boid.create = function(screenWidth, screenHeight) {
  var x = Math.floor(Math.random() * screenWidth);
  var y = Math.floor(Math.random() * screenHeight);
  var vel = new Vector(Math.random(), Math.random());
  vel = vel.normalize().scale(config.prey.speed);
  return new Boid(new Vector(x, y), vel);
}

Boid.prototype.findClosestPredator = function(predatorList, config) {
  if (predatorList.length === 0) {
    return -1;
  }

  var closestIndex = -1;
  var closestDist = config.env.screen.len2();
  var prey = this;

  predatorList.forEach(function(predator, index) {
    var dist = prey.pos.boundedDist(predator.pos, config.env.screen.x, config.env.screen.y);
    if (dist < closestDist) {
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

function calcMeanHeading(preyList) {
  var heading = new Vector(0, 0);
  preyList.forEach(function(prey) {
    heading = heading.add(prey.vel);
  });
  return heading.normalize();
}

function gaugeNeighbourDists(preyList, config) {
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
      var dist = prey.pos.boundedDist(neighbour.pos, config.env.screen.x,
          config.env.screen.y);
      neighbourDists.dist[i] += Math.sqrt(dist);

      // If the neighbour is within the minimum separation distance,
      // a vector pointing away from it is added to the 'tooClose' list.
      // Otherwise, the neighbour is too far and a vector pointing toward
      // it is added to the 'tooFar' list.
      if (dist < config.prey.minSeparation * config.prey.minSeparation) {
        var path = neighbour.pos.shortestBoundedPathTo(prey.pos, config.env.screen.x,
            config.env.screen.y);
        neighbourDists.tooClose[i].push(path.normalize());
      } else {
        var path = prey.pos.shortestBoundedPathTo(neighbour.pos, config.env.screen.x,
            config.env.screen.y);
        neighbourDists.tooFar[i].push(path.normalize());
      }
    });
    neighbourDists.dist[i] /= preyList.length;
  });
  return neighbourDists;
}

Boid.prototype.move = function(predators, tooFar, meanHeading, tooClose, dist, config) {
  // Calculate the cohesion vector.
  var cohesionVector = new Vector(0, 0);
  if (dist > 50) {
    tooFar.forEach(function(path) {
      cohesionVector = cohesionVector.add(path);
    });
    cohesionVector = cohesionVector.normalize().scale(config.weights.cohesion);
  }

  // Calculate the heading vector.
  var alignmentVector = meanHeading.normalize().scale(config.weights.alignment);

  // Calculate the separation vector. Currently all boids within the
  // separation radius are treated equally: is not a continuous function of
  // distance.
  var separationVector = new Vector(0, 0);
  tooClose.forEach(function(path) {
    separationVector = separationVector.add(path);
  });
  separationVector = separationVector.normalize().scale(config.weights.separation);

  // Find the closest predator. If the closest predator is within a certain
  // range, the boid wants to escape.
  var closestPredatorIndex = this.findClosestPredator(predators, config);
  var closestPredatorVector = new Vector(0, 0);

  // Check if the closest predator is within range to be noticed.
  if (closestPredatorIndex !== -1) {
    // Create a vector pointing away from the predator.
    var closestPredator = predators[closestPredatorIndex];
    closestPredatorVector = closestPredator.pos.shortestBoundedPathTo(this.pos,
        config.env.screen.x, config.env.screen.y);

    // Scale the weighting linearly as a function of length.
    var pDist = closestPredatorVector.len2();
    var nFactor = pDist / (config.prey.predatorSightDist
        * config.prey.predatorSightDist);
    var sFactor = 1 - nFactor;
    closestPredatorVector = closestPredatorVector.normalize()
        .scale(config.weights.flee * sFactor);
  }

  // Put everything together in one vector.
  var changeVector = cohesionVector.add(alignmentVector).add(separationVector).add(closestPredatorVector).normalize();

  var vAngle = this.vel.angle();
  var mAngle = changeVector.angle();

  var dAngle = diffAngle(mAngle, vAngle);
  dAngle = Math.min(dAngle, config.prey.maxTurnAngle);

  if (diffAngle(vAngle + dAngle, mAngle) > diffAngle(vAngle - dAngle, mAngle)) {
    vAngle -= dAngle;
  } else {
    vAngle += dAngle;
  }

  this.vel = new Vector(Math.cos(vAngle), Math.sin(vAngle));
  this.vel = this.vel.scale(config.prey.speed);

  // Bound the boid so that it stays on the screen.
  this.pos = this.pos.add(this.vel).bound(config.env.screen);
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
