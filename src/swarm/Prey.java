/**
 * Prey
 * Extends Creature to implement a prey that is part of the swarm.
 * @author Adam Heins
 * 2014-04-20
 */

package swarm;

import java.awt.Color;

public class Prey extends Creature {
	
	// Maximum angle that the prey can turn in one tick.
	private final double MAX_TURN_ANGLE = 2 * Math.PI / 20.0;
	
	// Number of nearest neighbours the prey factors into its movement.
	private final int NUM_NEIGHBOURS = 10;
	
	// Minimum comfortable distance between two prey.
	private final double SEPARATION_DISTANCE = 25.0;
	
	
	/**
	 * Default constructor.
	 */
	public Prey () {
		color = Color.black;
		radius = 4;
		speed = 3.0;
		bearing = 0;
	}
	
	
	/**
	 * Constructor.
	 * @param c - Color of the prey.
	 * @param r - Radius of the circle representing the prey.
	 */
	public Prey (Color color, int radius, double range, double bearing) {
		this.color = color;
		this.radius = radius;
		this.speed = range;
		this.bearing = bearing;
	}
	
	
	/**
	 * Move the prey.
	 * @param pred - The predator hunting the prey.
	 * @param swarm - The swarm of which this prey is a part.
	 */
	public void calculateMove (Predator pred, Prey [] swarm, int n, double homeX, double homeY) {
		
		// Distances to other members in the swarm.
		double [] distances = new double[swarm.length];	
		
		// Calculate distances to all members of the swarm.
		for (int i = 0; i < swarm.length; i++) {
			distances[i] = Math.sqrt((swarm[i].x - x) * (swarm[i].x - x) + (swarm[i].y - y) * (swarm[i].y - y));
		}
		
		
		// Array of neighbours in the swarm in ascending order of distance.
		int [] neighbours = new int[NUM_NEIGHBOURS];
		
		// Distances to neighbours in the swarm in ascending order.
		double [] neighbourDist = new double[NUM_NEIGHBOURS];
		
		// Find closest neighbours.
		for (int i = 0; i < NUM_NEIGHBOURS; i++) {
			
			int minDistPrey;
			if (n != 0)
				minDistPrey = 0;
			else
				minDistPrey = 1;
			
			for (int j = 0; j < swarm.length; j++) {
				if (j == n || search(neighbours, j))
					continue;
				if (distances[j] < distances[minDistPrey])
					minDistPrey = j;
			}
			
			neighbours[i] = minDistPrey;
			neighbourDist[i] = distances[minDistPrey];
		}
		
		
		// If your closest neighbour is too close, prioritize moving away.
		if (neighbourDist[0] < SEPARATION_DISTANCE) {
			double angle = Math.atan2(swarm[neighbours[0]].y - y, swarm[neighbours[0]].x - x) - bearing;
			
			if (angle < 0)
				bearing = (bearing + MAX_TURN_ANGLE) % (2 * Math.PI);
			else
				bearing = (bearing - MAX_TURN_ANGLE) % (2 * Math.PI);
		
		// Otherwise, prioritize staying close to neighbours and the home location.
		} else {		
			double xComp = 0;
			double yComp = 0;
			
			// Add components of vectors to neighbours.
			for (int i = 0; i < NUM_NEIGHBOURS; i++) {
				xComp += swarm[neighbours[i]].x - x;
				yComp += swarm[neighbours[i]].y - y;
			}
			
			// Add components of home vector.
			xComp += 2.0 * (homeX - x);
			yComp += 2.0 * (homeY - y);	
			
			// Calculate angle of movement vector.
			double angle = Math.atan2(yComp, xComp);
			
			// Calculate new bearing.
			if (bearing < angle)
				bearing = (bearing + Math.min(MAX_TURN_ANGLE, angle - bearing)) % (2 * Math.PI);
			else
				bearing = (bearing - Math.min(MAX_TURN_ANGLE, bearing - angle)) % (2 * Math.PI);
		}

		// Calculate new x and y coordinates.
		newX = x + speed * Math.cos(bearing);
		newY = y + speed * Math.sin(bearing);
	}
	
	
	/**
	 * Search through an integer array for a specific value.
	 * @param array - The array being searched.
	 * @param value - The value being searched for.
	 * @return True if the value is in the array, false otherwise.
	 */
	private boolean search (int [] array, int value) {
		for (int i = 0; i < array.length; i++) {
			if (array[i] == value)
				return true;
		}
		return false;
	}
}
