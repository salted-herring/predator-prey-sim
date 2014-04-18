/**
 * Predator
 * Extends Creature to implement a predator that hunts prey from the swarm.
 * @author Adam Heins
 * 2014-04-18
 */

package swarm;

import java.awt.Color;

public class Predator extends Creature {
	
	/**
	 * Default Constructor
	 */
	public Predator () {
		color = Color.red;
		radius = 10;
		range = 10;
	}
	
	
	/**
	 * Constructor
	 * @param c - Color of the predator.
	 * @param r - Radius of the circle representing the predator.
	 * @param range - Distance that the predator can move in one tick.
	 */
	public Predator (Color c, int r, int range) {
		color = c;
		radius = r;
		this.range = range;
	}
	
	
	/**
	 * Move the predator.
	 * @param swarm - Array of prey objects active in the simulation.
	 */
	public void move (Prey [] swarm) {
		
		int minDistPrey = 0;
		double minDist = Math.sqrt((swarm[0].x - x) * (swarm[0].x - x) + (swarm[0].y - y) * (swarm[0].y - y));
		
		// Find prey with the minimum distance to the predator
		for (int i = 1; i < swarm.length; i++) {
			double dist = Math.sqrt((swarm[i].x - x) * (swarm[i].x - x) + (swarm[i].y - y) * (swarm[i].y - y));
			if (dist < minDist) {
				minDistPrey = i;
				minDist = dist;
			}
		}
		
		// Move toward the closest prey
		x += (int)(((swarm[minDistPrey].x - x) / minDist) * range);
		y += (int)(((swarm[minDistPrey].y - y) / minDist) * range);
	}
}
