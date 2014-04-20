/**
 * Creature
 * Abstract class that is the superclass of the Prey and Predator classes.
 * @author Adam Heins
 * 2014-04-20
 */

package swarm;

import java.awt.Color;
import java.awt.Graphics;

public abstract class Creature {
	
	// Variables
	protected Color color;
	protected int radius;
	protected double speed;
	protected double newX, newY;
	
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
	 * Bounds a number between a high and low bound.
	 * @param num - The number to be bound.
	 * @param lowBound - The lower bound that the number cannot be beneath.
	 * @param highBound - The higher bound that the number cannot be above.
	 * @return The bounded number.
	 */
	protected double bound (double num, double lowBound, double highBound) {
		if (num > highBound)
			return highBound;
		if (num < lowBound)
			return lowBound;
		return num;
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
