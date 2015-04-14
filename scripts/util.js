/*
 * Utility functions for the Predator Prey Simulation.
 */

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

/*
 * Finds the difference between two angles, a and b. The difference is
 * expressed in absolute terms.
 *
 * @param a - An angle between [-PI, PI].
 * @param b - Another angle between [-PI, PI].
 *
 * Returns the absolute difference between angles a and b.
 */
function diffAngle(a, b) {
  var c = b - a;
  if (c > Math.PI) {
    c -= 2 * Math.PI;
  } else if (c < -Math.PI) {
    c += 2 * Math.PI;
  }
  return Math.abs(c);
}

/*
 * Draws a line between two vectors, a and b.
 *
 * @param ctx - The graphics context with which to draw.
 * @param a - The first vector.
 * @param b - The second vector.
 * @param color - The color in which to draw the line.
 */
function drawLine(ctx, a, b, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
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
