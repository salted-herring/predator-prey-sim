# Predator Prey Simulation
Simulates a flock of birds, similar to the artificial life program
[Boids](http://en.wikipedia.org/wiki/Boids). This simulation also introduces a
'predator': a specific type of boid that hunts others, which are known as the
'prey'. Try the simulation
[here](https://adamheins.com/projects/predator-prey-sim/).

## Behaviour
The prey move based on a number of rules:
* Prey like to travel in the direction as each other.
* Prey like to be close to the rest of the flock.
* Prey try to avoid hitting others that are too close.
* Prey flee from predators who get close.

The predators are much simpler, and follow only a single rule:
* Chase (and kill, if possible) the nearest prey.

## Controls
Launch the simulation by selecting the number of predators and prey with which
to start, and then press the 'Launch' button. The simulation can be paused and
played again by clicking on the canvas. Various parameters can be altered by
adjusting the different sliders.

## License
MIT license. See the LICENSE file for the full terms.
