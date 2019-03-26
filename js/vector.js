/*
 * Copyright (c) 2015 Adam Heins
 *
 * This file is part of the Predator Prey Simulation project, which is
 * distributed under the MIT license. For the full terms, see the included
 * LICENSE file.
 */
import Utils from './util'

/*
 * 2D vector constructor.
 *
 * @param x - x-component of the vector.
 * @param y - y-component of the vector.
 */
function Vector(x, y) {
  this.x = x
  this.y = y
}

/*
 * Creates a new vector that is a scalar multiple of this one.
 *
 * @param scalar - The scalar by which the vector should be multiplied.
 *
 * Returns a new vector scaled by the scalar.
 */
Vector.prototype.scale = function(scalar) {
  return new Vector(this.x * scalar, this.y * scalar)
}

/*
 * Converts both coordinates of the vector to their absolute values.
 *
 * Returns a new vector that is the absolute value of this one.
 */
Vector.prototype.abs = function() {
  return new Vector(Math.abs(this.x), Math.abs(this.y))
}

/*
 * Calculates the length of this vector.
 *
 * Returns the length of this vector.
 */
Vector.prototype.len = function() {
  return Math.sqrt(this.len2())
}

/* Calculates the squared length of this vector.
 *
 * Returns the squared length of this vector.
 */
Vector.prototype.len2 = function() {
  return this.x * this.x + this.y * this.y
}

/*
 * Calculates the angle formed by this vector.
 *
 * Returns the angle formed by this vector, in [-PI, PI].
 */
Vector.prototype.angle = function() {
  return Math.atan2(this.y, this.x)
}

/*
 * Creates a new vector that is a normalized version of this one, such that its
 * length is 1.
 *
 * Returns a new vector that is a normalized vector of this one.
 */
Vector.prototype.normalize = function() {
  let len = this.len()
  if (len === 0) return this
  return new Vector(this.x / len, this.y / len)
}

/*
 * Adds the other vector to this one.
 *
 * @param other - The vector to add to this one.
 *
 * Returns a new vector that is the sum of this and the other one.
 */
Vector.prototype.add = function(other) {
  return new Vector(this.x + other.x, this.y + other.y)
}

/*
 * Subtracts the other vector from this one.
 *
 * @param other - The vector to subtract from this one.
 *
 * Returns a new vector that is the difference between this one and @other.
 */
Vector.prototype.subtract = function(other) {
  return new Vector(this.x - other.x, this.y - other.y)
}

/*
 * Bound the vector between (0, 0) and the bounds vector.
 *
 * @param bounds - The upper bounds.
 *
 * Returns a new vector that is bounded between (0, 0) and bounds.
 */
Vector.prototype.bound = function(bounds) {
  let bounded = new Vector(this.x % bounds.x, this.y % bounds.y)
  if (bounded.x < 0) {
    bounded.x = bounds.x + bounded.x
  }
  if (bounded.y < 0) {
    bounded.y = bounds.y + bounded.y
  }
  return bounded
}

/*
 * Calculates the bounded distance between this vector and another. The area
 * is bounded by [0, xBound] in the x-direction and [0, yBound] in the
 * y-direction. Values wrap around at these boundaries.
 *
 * @param other - The vector to which to find the bounded distance.
 * @param xBound - The upper bound in the x-direction.
 * @param yBound - The upper bound in the y-direction.
 *
 * Returns a number representing the shortest distance between the two vectors.
 */
Vector.prototype.boundedDist = function(other, bounds) {
  // First, find the absolute distance between the vectors.
  let d = this.subtract(other).abs()

  // Check if the distances would be shorter if wrapped around the screen.
  d.x = Math.min(d.x, bounds.x - d.x)
  d.y = Math.min(d.y, bounds.y - d.y)
  return d.len2()
}

/*
 * Calculates a new a vector that is the shortest path from this vector to
 * another given the bounds on the area's size.
 *
 * @param other - The vector from which the path begins.
 * @param xBound - The upper bound in the x-direction.
 * @param yBound - The lower bound in the y-direction.
 *
 * Returns a new vector representing the shortest bounded path.
 */
Vector.prototype.shortestBoundedPathTo = function(other, xBound, yBound) {
  let vector = other.subtract(this)
  if (vector.x < 0) {
    vector.x = Utils.absMin(vector.x, vector.x + xBound)
  } else {
    vector.x = Utils.absMin(vector.x, vector.x - xBound)
  }
  if (vector.y < 0) {
    vector.y = Utils.absMin(vector.y, vector.y + yBound)
  } else {
    vector.y = Utils.absMin(vector.y, vector.y - yBound)
  }
  return vector
}

/*
 * Normalizes and scales this vector so that its length lies between 0 and 1.
 * If the length of this vector is lower, the length of the linearized vector
 * will be 0. If the length of this vector is upper, the lenght of the
 * linearized vector will be 1.
 *
 * @param lower - The lower bound to scale between.
 * @param upper - The upper bound to scale between.
 *
 * Returns a vector with same directon as this one, scaled between 0 and 1.
 */
Vector.prototype.linearNormalize = function(lower, upper) {
  let len = this.len()
  let scaleFactor = (len - lower) / (upper - lower)
  return this.normalize().scale(scaleFactor)
}

/*
 * Normalizes and scales this vector so that its length lies between 0 and 1.
 * If the length of this vector is lower, the length of the linearized vector
 * will be 1. If the length of this vector is upper, the lenght of the
 * linearized vector will be 0. This is the reverse of the linearNormalize
 * method.
 *
 * @param lower - The lower bound to scale between.
 * @param upper - The upper bound to scale between.
 *
 * Returns a vector with same directon as this one, scaled between 0 and 1.
 */
Vector.prototype.reverseLinearNormalize = function(lower, upper) {
  let len = this.len()
  let scaleFactor = (len - lower) / (upper - lower)
  return this.normalize().scale(1 - scaleFactor)
}

export default Vector
