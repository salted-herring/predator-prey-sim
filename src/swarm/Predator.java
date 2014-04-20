/**
 * Predator
 * Extends Creature to implement a predator that hunts prey from the swarm.
 * @author Adam Heins
 * 2014-04-20
 */

package swarm;

import java.awt.Color;

public class Predator extends Creature {
	
	/**
	 * Default constructor.
	 */
	public Predator () {
		color = Color.red;
		radius = 10;
		speed = 4.0;
		bearing = 0;
	}
	
	
	/**
	 * Constructor.
	 * @param c - Color of the predator.
	 * @param r - Radius of the circle representing the predator.
	 * @param range - Distance that the predator can move in one tick.
	 */
	public Predator (Color color, int radius, double range, double bearing) {
		this.color = color;
		this.radius = radius;
		this.speed = range;
		this.bearing = bearing;
	}
	
	
	/**
	 * Move the predator.
	 * @param swarm - Array of prey objects active in the simulation.
	 */
	public void calculateMove (Prey [] swarm) {
		
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
		newX += ((swarm[minDistPrey].x - x) / minDist) * speed;
		newY += ((swarm[minDistPrey].y - y) / minDist) * speed;
	}
}
