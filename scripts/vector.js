/*
 * 2D vector constructor.
 *
 * @param x - x-component of the vector.
 * @param y - y-component of the vector.
 */
function Vector(x, y) {
  this.x = x;
  this.y = y;
}

/*
 * Normalizes this vector so that its length is equal to one.
 */
Vector.prototype.normalize = function() {
  len = this.len();
  if (len == 0)
    return;
  this.x /= len;
  this.y /= len;
}

/*
 * Scales this vector.
 *
 * @param scalar - The scalar by which the vector should be multiplied.
 */
Vector.prototype.scale = function(scalar) {
  this.x *= scalar;
  this.y *= scalar;
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
  var vector = other.subtract(this);
  if (vector.x < 0) {
    vector.x = absMin(vector.x, vector.x + xBound);
  } else {
    vector.x = absMin(vector.x, vector.x - xBound);
  }
  if (vector.y < 0) {
    vector.y = absMin(vector.y, vector.y + yBound);
  } else {
    vector.y = absMin(vector.y, vector.y - yBound);
  }
  return vector;
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
Vector.prototype.boundedDist = function(other, xBound, yBound) {
  var d = this.subtract(other).abs();
  d.x = Math.min(d.x, xBound - d.x);
  d.y = Math.min(d.y, xBound - d.y);
  return d.len2();
}

/*
 * Subtracts the @other vector from this one.
 *
 * @param other - The vector being subtracted from this one.
 *
 * Returns a new vector that is the difference between this one and @other.
 */
Vector.prototype.subtract = function(other) {
  return new Vector(this.x - other.x, this.y - other.y);
}

Vector.prototype.add = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
}

Vector.prototype.abs = function() {
  return new Vector(Math.abs(this.x), Math.abs(this.y));
}

Vector.prototype.bound = function(xU, yU) {
  var bounded = new Vector(this.x % xU, this.y % yU);
  if (bounded.x < 0) {
    bounded.x = xU + bounded.x;
  }
  if (bounded.y < 0) {
    bounded.y = yU + bounded.y;
  }
  return bounded;
}

Vector.prototype.len = function() {
  return Math.sqrt(this.len2());
}

Vector.prototype.len2 = function() {
  return this.x * this.x + this.y * this.y;
}

Vector.prototype.angle = function() {
  return Math.atan2(this.y, this.x);
}
