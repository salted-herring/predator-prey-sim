/*
 * Copyright (c) 2015 Adam Heins
 *
 * This file is part of the Predator Prey Simulation project, which is
 * distributed under the MIT license. For the full terms, see the included
 * LICENSE file.
 *
 *
 * Prey like to form flocks. They follow some basic rules:
 *   - Prey like to travel in the same direction as others.
 *   - Prey like to be close to the rest of their flock.
 *   - Prey try to avoid hitting others who are too close.
 *   - Prey flee from predators who get too close.
 */
import Util from './util'
import Vector from './vector'

/*
 * Prey constructor.
 *
 * @param position - The initial location of the prey.
 * @param velocity - The initial velocity of the prey.
 */
function Prey(position, velocity) {
  this.pos = position
  this.vel = velocity
  this.isKilled = false
}

/*
 * Creates a new prey in a random location on the screen.
 *
 * @param speed - The speed of the prey.
 * @param bounds - The upper bounds within which the prey are to be generated.
 *
 * Returns a new prey in a random location within the bounds.
 */
Prey.create = function(speed, bounds) {
  // Generate a random position for the prey.
  let x = Math.floor(Math.random() * bounds.x)
  let y = Math.floor(Math.random() * bounds.y)

  // Create a random velocity vector with the required speed.
  let vel = new Vector(Math.random(), Math.random())
  vel = vel.normalize().scale(speed)

  return new Prey(new Vector(x, y), vel)
}

/*
 * Finds the closest predator to this prey.
 *
 * @param predatorList - The list of predators.
 * @param predatorSightDist - The maximum distance within which a prey can see
 *     a predator.
 * @param screen - A vector representing the dimensions of the screen.
 *
 * Returns the closest predator, or null if no predators are within a notable
 * distance.
 */
Prey.prototype.findClosestPredator = function(
  predatorList,
  predatorSightDist,
  screen
) {
  if (predatorList.length === 0) {
    return null
  }

  let closestIndex = null
  let closestDist = screen.len2()
  let prey = this

  predatorList.forEach(function(predator, index) {
    let dist = prey.pos.boundedDist(predator.pos, screen)
    if (dist < closestDist) {
      closestDist = dist
      closestIndex = index
    }
  })

  // Check if the closest predator is actually within a distance that the prey
  // cares about.
  if (closestDist < predatorSightDist * predatorSightDist) {
    return predatorList[closestIndex]
  } else {
    return null
  }
}

/*
 * Moves this prey, based on a number of factors including proximity to other
 * prey, heading, and nearby predators.
 *
 * @param predatorList - The list of predators.
 * @param maxTurnAngle - The maximum turning angle of the prey.
 * @param predatorSightDist - The maximum distance within which the prey can
 *     see a predator.
 * @param tooFar - A list of vectors pointing toward those neighbours which are
 *     too far from this one.
 * @param meanHeading - The mean heading of all of the prey.
 * @param tooClose - A list of vectors pointing away from those neighbours
 *     which are too close to this one.
 * @param dist - The average distance from this boid to all of the other ones.
 * @param minFlockDist - The distance from the center of the flock at which
 *     this boid does not feel the desire to get any closer.
 * @param screen - A vector representing the screen dimensions.
 * @param weights - An object containing the weighting of each factor affecting
 *     the prey's movement.
 */
Prey.prototype.move = function(
  predatorList,
  maxTurnAngle,
  predatorSightDist,
  tooFar,
  meanHeading,
  tooClose,
  dist,
  minFlockDist,
  screen,
  weights,
  speed
) {
  // Calculate the cohesion vector.
  let cohesionVector = new Vector(0, 0)
  if (dist > minFlockDist) {
    tooFar.forEach(function(path) {
      cohesionVector = cohesionVector.add(path)
    })
    cohesionVector = cohesionVector.normalize().scale(weights.cohesion)
  }

  // Calculate the heading vector.
  let alignmentVector = meanHeading.normalize().scale(weights.alignment)

  // Calculate the separation vector. Currently all prey  within the
  // separation radius are treated equally: is not a continuous function of
  // distance.
  let separationVector = new Vector(0, 0)
  tooClose.forEach(function(path) {
    separationVector = separationVector.add(path)
  })
  separationVector = separationVector.normalize().scale(weights.separation)

  // Find the closest predator. If the closest predator is within a certain
  // range, the prey wants to escape.
  let closestPredator = this.findClosestPredator(
    predatorList,
    predatorSightDist,
    screen
  )
  let closestPredatorVector = new Vector(0, 0)

  if (closestPredator) {
    // Create a vector pointing away from the predator.
    closestPredatorVector = closestPredator.pos.shortestBoundedPathTo(
      this.pos,
      screen.x,
      screen.y
    )

    // Scale the weighting linearly as a function of length.
    closestPredatorVector = closestPredatorVector
      .reverseLinearNormalize(0, predatorSightDist)
      .scale(weights.flee)
  }

  // Put everything together in one vector.
  let changeVector = cohesionVector
    .add(alignmentVector)
    .add(separationVector)
    .add(closestPredatorVector)
    .normalize()

  // Update the velocity of the prey.
  let turnAngle = Util.turn(this.vel, changeVector, maxTurnAngle)
  this.vel = new Vector(Math.cos(turnAngle), Math.sin(turnAngle))
  this.vel = this.vel.scale(speed)

  // Update the prey's position and bound it so that it stays on the screen.
  this.pos = this.pos.add(this.vel).bound(screen)
}

/*
 * Draws this prey.
 *
 * @param ctx - The graphics context with which to draw.
 * @param color - The color with which to draw the prey.
 */
Prey.prototype.draw = function(ctx, color) {
  if (this.isKilled !== false) {
    color = Util.hexToRgbA(color, this.isKilled)
  }

  Util.drawTriangle(
    ctx,
    this.pos.x,
    this.pos.y,
    20,
    12,
    this.vel.angle(),
    color
  )
}

/*
 * Calculates the mean heading of the prey.
 * The mean heading is simply the average direction that the prey are heading.
 *
 * @param preyList - The list of prey.
 *
 * Returns a Vector representing the average heading.
 */
Prey.calcMeanHeading = function(preyList) {
  let heading = new Vector(0, 0)
  preyList.forEach(function(prey) {
    heading = heading.add(prey.vel)
  })
  return heading.normalize()
}

/*
 * Calculate the distance from this prey to each of its neighbours.
 * The neighbours are sorted into two categories: those which are too close,
 * and those which are too far.
 *
 * @param preyList - The list of prey.
 * @param minSeparation - The minimum distance that prey require between each
 *     other to avoid collisions.
 * @param screen - A vector representing the dimensions of the screen.
 *
 * Returns an object containing vectors pointing away from neighbours who are
 * too close, vectors pointing toward prey that are too far, and the average
 * distance from this prey to the rest of its neighbours.
 */
Prey.calcNeighbourDists = function(preyList, minSeparation, screen) {
  // Prey are difficult to satisfy: they want to be close to each
  // other in a flock, but not so close as to risk hitting each
  // other.
  let neighbourDists = {
    tooClose: [],
    tooFar: [],
    dist: []
  }

  preyList.forEach(function(prey, i, preyList) {
    neighbourDists.tooClose.push([])
    neighbourDists.tooFar.push([])
    neighbourDists.dist[i] = 0

    preyList.forEach(function(neighbour, j) {
      // The prey shouldn't take itself into account.
      if (i === j) {
        return
      }

      // Find the distance between the two prey.
      let dist = prey.pos.boundedDist(neighbour.pos, screen)
      neighbourDists.dist[i] += Math.sqrt(dist)

      // If the neighbour is within the minimum separation distance,
      // a vector pointing away from it is added to the 'tooClose' list.
      // Otherwise, the neighbour is too far and a vector pointing toward
      // it is added to the 'tooFar' list.
      if (dist < minSeparation * minSeparation) {
        let path = neighbour.pos.shortestBoundedPathTo(
          prey.pos,
          screen.x,
          screen.y
        )
        neighbourDists.tooClose[i].push(
          path.reverseLinearNormalize(0, minSeparation)
        )
      } else {
        let path = prey.pos.shortestBoundedPathTo(
          neighbour.pos,
          screen.x,
          screen.y
        )
        neighbourDists.tooFar[i].push(path.normalize())
      }
    })
    neighbourDists.dist[i] /= preyList.length
  })
  return neighbourDists
}

export default Prey
