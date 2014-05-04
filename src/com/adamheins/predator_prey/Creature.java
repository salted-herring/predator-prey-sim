/**
 * Creature
 * Abstract class that is the superclass of the Prey and Predator classes.
 * @author Adam Heins
 * 2014-05-03
 */

package com.adamheins.predator_prey;

import java.awt.Color;
import java.awt.Graphics;

public abstract class Creature {
	
	protected final double TAU = 2 * Math.PI;
	
	// Variables
	protected Color color;
	protected int radius;
	protected double speed;
	protected double newX, newY;
	protected double newBearing;
	
	public double bearing;
	public double x, y;
	
	
	/**
	 * Generate a random (x,y) location within the specified width and height.
	 * @param width - Width within which the Creature should be generated.
	 * @param height - Height within which the Creature should be generated.
	 */
	public void generateLoc (int width, int height) {
		newX = radius + Math.random() * (width - 2 * radius);
		newY = radius + Math.random() * (height - 2 * radius);
		x = newX;
		y = newY;
	}
	
	
	/**
	 * Confirm movement of creature.
	 * Set x and y equal to the new values calculated in the calculateMove() method.
	 */
	public void move () {
		x = newX;
		y = newY;
		bearing = newBearing;
	}
	
	
	/**
	 * Draw the creature.
	 * @param g - Graphics object used for drawing.
	 */
	public void draw (Graphics g) {
		g.setColor(color);
		g.fillOval((int)x - radius, (int)y - radius, 2 * radius, 2 * radius);
	}
	
	
	/**
	 * Bounds an angle between negative pi and pi.
	 * @param angle The angle to be bound.
	 * @return The bounded angle.
	 */
	protected double bound (double angle) {
		if (angle > Math.PI)
			return angle - TAU;
		else if (angle < -Math.PI)
			return angle + TAU;
		return angle;
	}
	
	
	/**
	 * Set the location of the creature.
	 * @param x - The x-coordinate of the creature.
	 * @param y - The y-coordinate of the creature.
	 */
	public void setLocation (int x, int y) {
		this.x = x;
		this.y = y;
	}
	
	
	/**
	 * Set the color of the creature.
	 * @param c - New color of the creature.
	 */
	public void setColor (Color c) {
		color = c;
	}
	
	
	/**
	 * Set the radius of the circle representing the creature.
	 * @param r - New radius of the creature.
	 */
	public void setRadius (int r) {
		radius = r;
	}
}
