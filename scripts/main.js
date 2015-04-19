var limits = {
  weights: {
    separation: { min: 0, max: 10 },
    alignment:  { min: 0, max: 10 },
    cohesion:   { min: 0, max: 10 },
    flee:       { min: 0, max: 10 }
  },
  prey: {
    speed: { min: 0.0, max: 10.0 }
  },
  predator: {
    speed: { min: 0.0, max: 10.0 }
  }
};

/*
 * Configurable options for the simulation.
 */
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
    maxTurnAngle: 0.1,
    minSeparation: 25.0,
    predatorSightDist: 200,
    minFlockDist: 80
  },
  predator: {
    speed: 2.5,
    number: 0,
    killDist: 6.0,
    maxTurnAngle: 0.02
  },
  env: {
    delay: 50
  }
};

/*
 * Moves the predators.
 *
 * @param predatorList - The list of predators to move.
 * @param preyList - The list of prey for the predators to pursue.
 */
function movePredators(predatorList, preyList) {
  predatorList.forEach(function(predator) {
    predator.move(preyList, config.predator.speed,
        config.predator.maxTurnAngle, config.predator.killDist, config.env.ctx,
        config.env.screen);
  });
}

/*
 * Moves the prey.
 *
 * @param preyList - The list of prey to move.
 * @param predatorList - List of predators to avoid.
 */
function movePrey(preyList, predatorList) {
  var neighbourDists = gaugeNeighbourDists(preyList, config.prey.minSeparation,
      config.env.screen);
  var meanHeading = calcMeanHeading(preyList);
  preyList.forEach(function(prey, index) {
    prey.move(predatorList, config.prey.maxTurnAngle,
        config.prey.predatorSightDist, neighbourDists.tooFar[index],
        meanHeading, neighbourDists.tooClose[index], neighbourDists.dist[index],
        config.prey.minFlockDist, config.env.screen, config.weights);
  });
}

/*
 * Initialize the arrays of prey and predators.
 */
function init() {
  var prey = [];
  var predators = [];
  for (var i = 0; i < config.prey.number; ++i) {
    prey.push(Prey.create(config.prey.speed, config.env.screen));
  }
  for (var i = 0; i < config.predator.number; ++i) {
    predators.push(Predator.create(config.predator.speed, config.env.screen));
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
 * @preyList - The list of prey.
 * @predators - The list of predators.
 */
function render(ctx, preyList, predators) {
  ctx.clearRect(0, 0, config.env.screenWidth, config.env.screenHeight);
  preyList.forEach(function(prey) {
    prey.draw(ctx, 'black');
  });
  predators.forEach(function(predator) {
    predator.draw(ctx, 'red');
  });
}

/*
 * Moves all of the creatures in the simulation.
 *
 * @preyList - The list of prey
 * @predatorList - The list of predators.
 */
function move(preyList, predatorList) {
  movePredators(predatorList, preyList);
  movePrey(preyList, predatorList);
}

/*
 * Main program loop.
 *
 * @ctx - The graphics context with which to draw.
 * @preyList - The list of prey.
 * @predatorList - The list of predators.
 */
function loop(ctx, preyList, predatorList) {
  render(ctx, preyList, predatorList);
  move(preyList, predatorList);
}

function pause() {
  clearInterval(config.env.interval);
  config.env.interval = null;
}

function play() {
  config.env.interval = setInterval(function() {
    loop(config.env.ctx, config.preyList, config.predatorList)
  }, config.env.delay);
}

/*
 * Program set up and launch.
 */
function run() {
  var canvas = document.getElementById('boidsCanvas');
  var ctx = canvas.getContext('2d');

  config.env.screenWidth = canvas.width;
  config.env.screenHeight = canvas.height;
  config.env.ctx = ctx;
  config.env.screen = new Vector(canvas.width, canvas.height);

  var creatures = init();
  config.preyList = creatures.prey;
  config.predatorList = creatures.predators;

  config.env.interval = setInterval(function() {
    loop(ctx, creatures.prey, creatures.predators)
  }, config.env.delay);
}

/*
 * Sets up the sliders, which control different parameters in the simulation.
 *
 * @param block - The block in which the slider should be placed.
 * @param limits - The limits object bounded the slider.
 * @param config - The config object that gives the value of each slider.
 */
function setupSliders(block, limits, config) {
  for (attr in limits) {
    // Label for the slider.
    var name = attr.charAt(0).toUpperCase() + attr.slice(1);
    var label = $('<label for="slider-' + attr + '">' + name + '</label>');

    // Create the slider.
    var min = limits[attr].min;
    var max = limits[attr].max;
    var val = config[attr];
    var slider = $('<input id="slider-' + attr + '" type="range" min="' + min
        + '" max="' + max + '" value="' + val + '">');

    // Add event listener for input events on the slider.
    slider.on('input', '', attr, function(e) {
      var attr = e.data;
      config[attr] = this.value;
      console.log(attr + ' = ' + this.value);
    });

    // Add the label and slider to the block.
    block.append(label);
    block.append(slider);
  }
}

// Set up sliders for changing values.
$(document).ready(function() {
  setupSliders($('#weights'), limits.weights, config.weights);
  setupSliders($('#prey'), limits.prey, config.prey);
  setupSliders($('#predators'), limits.predator, config.predator);

  var canvas = $('#boidsCanvas');
  canvas.on('click', function() {
    if (config.env.interval) {
      pause();
    } else {
      play();
    }
  });

  var launch = $('#launch');
  launch.on('click', function() {
    config.prey.number = $('#numPrey').val();
    config.predator.number = $('#numPredators').val();
    pause();
    run();
  });
});
