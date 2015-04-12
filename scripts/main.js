var config = {
  weights : {
    separation: 2.0,
    alignment: 1.0,
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
    speed: 2.5,
    number: 1,
    killDist: 6.0,
    maxTurnAngle: 0.2
  },
  env: {
    delay: 50
  }
};

/*
 * Calculates the value with the least magnitude.
 *
 * @param a - The first value.
 * @param b - The second value.
 *
 * Returns the value with the least magnitude.
 */
function absMin(a, b) {
  return Math.abs(a) < Math.abs(b) ? a : b;
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


function movePredators(predatorList, preyList) {
  predatorList.forEach(function(predator) {
    predator.move(preyList, config);
  });
}

function movePrey(preyList, predators) {
  //var dists = calcSeparations(preyList);
  var neighbourDists = gaugeNeighbourDists(preyList, config);
  var meanHeading = calcMeanHeading(preyList);
  //var centerOfMass = calcCenterOfMass(preyList);
  preyList.forEach(function(prey, index) {
    prey.move(predators, neighbourDists.tooFar[index], meanHeading,
        neighbourDists.tooClose[index], neighbourDists.dist[index], config);
  });
}

/*
 * Draws a triangle centered on x and y and aimed toward angle.
 *
 * @param ctx - The graphics context with which to draw.
 * @param x - The x-coordinate of the point on which the triangle is centered.
 * @param y - The y-coordinate of the point on which the triangle is centered.
 * @param distForward - The distance between the center point and the front
 *     point of the triangle.
 * @param distBackward - The distance between the center point and the back
 *     two points of the triangle.
 * @param angle - The orientation angle.
 */
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
