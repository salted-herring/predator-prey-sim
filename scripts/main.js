var config = {
  weights : {
    separation: 2.0,
    alignment: 2.0,
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
    speed: 4.0,
    number: 0,
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

function Predator(position, velocity) {
  this.pos = position;
  this.vel = velocity;
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
  var heading = new Vector(0, 0);
  preyList.forEach(function(prey) {
    heading = heading.add(prey.vel);
  });
  return heading;
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
      var d = boids[i].pos.shortestBoundedPath(boids[j].pos, config.env.screenWidth, config.env.screenHeight);

      if (d.len2() < config.prey.minSeparation * config.prey.minSeparation) {
        dists[i].push(d);
      }
    }
  }
  return dists;
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

function diffAngle(a, b) {
  var c = b - a;
  if (c > Math.PI) {
    c -= 2 * Math.PI;
  } else if (c < -Math.PI) {
    c += 2 * Math.PI;
  }
  return Math.abs(c);
}

function drawLine(ctx, a, b) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
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

function movePredators(predatorList, preyList) {
  predatorList.forEach(function(predator) {
    predatorList.move(preyList);
  });
}

function movePrey(preyList, predators) {
  var dists = calcSeparations(preyList);
  var meanHeading = calcMeanHeading(preyList);
  var centerOfMass = calcCenterOfMass(preyList);
  preyList.forEach(function(prey, index) {
    prey.move(predators, centerOfMass, meanHeading, dists[index], config);
  });
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
  movePrey(boids, predators);
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
  config.env.screen = new Vector(canvas.width, canvas.height);

  var creatures = init(config.env.screenWidth, config.env.screenHeight);
  setInterval(function() {
    loop(ctx, creatures.prey, creatures.predators)
  }, config.env.delay);
}

main();
