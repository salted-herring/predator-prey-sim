/**
 * Creature
 * Abstract class that is the superclass of the Prey and Predator classes.
 * @author Adam Heins
 * 2014-04-18
 */

package swarm;

import java.awt.Color;
import java.awt.Graphics;

public abstract class Creature {
	
	// Variables
	protected Color color;
	protected int radius;
	protected int range;
	
	public int x, y;
	
	
	/**
	 * Generate a random (x,y) location within the specified width and height.
	 * @param width - Width within which the Creature should be generated.
	 * @param height - Height within which the Creature should be generated.
	 */
	public void generateLoc (int width, int height) {
		x = (int)(radius + Math.random() * (width - 2 * radius));
		y = (int)(radius + Math.random() * (height - 2 * radius));
	}
	
	
	/**
	 * Draw the creature.
	 * @param g - Graphics object used for drawing.
	 */
	public void draw (Graphics g) {
		g.setColor(color);
		g.fillOval(x - radius, y - radius, 2 * radius, 2 * radius);
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
