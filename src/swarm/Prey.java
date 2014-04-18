/**
 * Prey
 * Extends Creature to implement a prey that is part of the swarm.
 * @author Adam Heins
 * 2014-04-18
 */

package swarm;

import java.awt.Color;

public class Prey extends Creature {
	
	/**
	 * Default Constructor.
	 */
	public Prey () {
		color = Color.black;
		radius = 4;
	}
	
	
	/**
	 * Constructor.
	 * @param c - Color of the prey.
	 * @param r - Radius of the circle representing the prey.
	 */
	public Prey (Color color, int radius, int range) {
		this.color = color;
		this.radius = radius;
		this.range = range;
	}
	
	
	/**
	 * Move the prey.
	 * @param pred - The predator hunting the prey.
	 * @param swarm - The swarm of which this prey is a part.
	 */
	public void move (Predator pred, Prey [] swarm) {
		
	}
}
