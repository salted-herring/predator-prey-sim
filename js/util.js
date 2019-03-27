/*
 * Copyright (c) 2015 Adam Heins
 *
 * This file is part of the Predator Prey Simulation project, which is
 * distributed under the MIT license. For the full terms, see the included
 * LICENSE file.
 *
 *
 * Utility functions for the Predator Prey Simulation.
 */
function Utils() {}

/*
 * Calculates the value with the least magnitude.
 *
 * @param a - The first value.
 * @param b - The second value.
 *
 * Returns the value with the least magnitude.
 */
Utils.absMin = function(a, b) {
  return Math.abs(a) < Math.abs(b) ? a : b
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
Utils.diffAngle = function(a, b) {
  let c = b - a
  if (c > Math.PI) {
    c -= 2 * Math.PI
  } else if (c < -Math.PI) {
    c += 2 * Math.PI
  }
  return Math.abs(c)
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
 * @param color - The color of the triangle.
 */
Utils.drawTriangle = function(
  ctx,
  x,
  y,
  distForward,
  distBackward,
  angle,
  color
) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(
    x + distForward * Math.cos(angle),
    y + distForward * Math.sin(angle)
  )
  ctx.lineTo(
    x + distBackward * Math.cos(angle + 2.094),
    y + distBackward * Math.sin(angle + 2.094)
  )
  ctx.lineTo(
    x + distBackward * Math.cos(angle + 4.189),
    y + distBackward * Math.sin(angle + 4.189)
  )
  ctx.fill()
}

Utils.drawCircle = function(ctx, x, y, radius, colour) {
  ctx.fillStyle = colour
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.fill()
}

Utils.hexToRgbA = function(hex, alpha) {
  let c = ''

  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('')
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    }
    c = '0x' + c.join('')
    return (
      'rgba(' +
      [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') +
      ',' +
      alpha +
      ')'
    )
  }
  throw new Error('Bad Hex')
}

/*
 * Calculates the new heading angle based on the current heading,
 * the desired heading, and the maximum turn angle.
 *
 * @param currentHeading - The current heading vector.
 * @param desiredHeading - The desired heading vector. The heading angle tends
 *     toward this angle.
 * @param maxTurnAngle - The maximum angle than can be turned at once.
 *
 * Returns the updated angle of the heading.
 */
Utils.turn = function(currentHeading, desiredHeading, maxTurnAngle) {
  let currentAngle = currentHeading.angle()
  let desiredAngle = desiredHeading.angle()

  // Get the absolute difference in angle.
  let deltaAngle = this.diffAngle(currentAngle, desiredAngle)

  // Ensure delta angle does not exceed the max allowed value.
  deltaAngle = Math.min(deltaAngle, maxTurnAngle)

  // Determine which direction the predator should turn to get closest to its
  // desired direction.
  if (
    this.diffAngle(currentAngle + deltaAngle, desiredAngle) >
    this.diffAngle(currentAngle - deltaAngle, desiredAngle)
  ) {
    currentAngle -= deltaAngle
  } else {
    currentAngle += deltaAngle
  }
  return currentAngle
}

/*
 * Draws a line between two vectors, a and b.
 *
 * @param ctx - The graphics context with which to draw.
 * @param a - The first vector.
 * @param b - The second vector.
 * @param color - The color in which to draw the line.
 */
Utils.drawLine = function(ctx, a, b, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.stroke()
}

export default Utils
