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
    maxTurnAngle: 0.05,
    minSeparation: 25.0,
    predatorSightDist: 200
  },
  predator: {
    speed: 2.5,
    number: 1,
    killDist: 6.0,
    maxTurnAngle: 0.02
  },
  env: {
    delay: 50
  }
};

function movePredators(predatorList, preyList) {
  predatorList.forEach(function(predator) {
    predator.move(preyList, config);
  });
}

function movePrey(preyList, predators) {
  var neighbourDists = gaugeNeighbourDists(preyList, config);
  var meanHeading = calcMeanHeading(preyList);
  preyList.forEach(function(prey, index) {
    prey.move(predators, neighbourDists.tooFar[index], meanHeading,
        neighbourDists.tooClose[index], neighbourDists.dist[index], config);
  });
}

/*
 * Initialize the arrays of prey and predators.
 */
function init(screenWidth, screenHeight) {
  var prey = [];
  var predators = [];
  for (var i = 0; i < config.prey.number; ++i) {
    prey.push(Boid.create(config));
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
    boid.draw(ctx, 'black');
  });
  predators.forEach(function(predator) {
    predator.draw(ctx, 'red');
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
