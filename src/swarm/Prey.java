/**
 * Prey
 * Extends Creature to implement a prey that is part of the swarm.
 * @author Adam Heins
 * 2014-04-28
 */

package swarm;

import java.awt.Color;

public class Prey extends Creature {
	
	// Maximum angle that the prey can turn in one tick.
	private final double MAX_TURN_ANGLE = 2 * Math.PI / 30.0;
	
	// Number of nearest neighbours the prey factors into its movement.
	private final int NUM_NEIGHBOURS = 10;
	
	
	/**
	 * Default constructor.
	 */
	public Prey () {
		color = Color.black;
		radius = 2;
		speed = 6.0;
		bearing = 0;
		newBearing = 0;
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
		newBearing = bearing;
	}
	
	
	/**
	 * Move the prey.
	 * @param pred - The predator hunting the prey.
	 * @param swarm - The swarm of which this prey is a part.
	 */
	public void calculateMove (Predator pred, Prey [] swarm, int n, double homeX, double homeY) {
		
		// Distances to other members in the swarm.
		double [] distances = new double[swarm.length];	
		
		// Average bearing of the entire swarm
		double swarmBearing = 0;
		
		// Calculate distances to all members of the swarm.
		for (int i = 0; i < swarm.length; i++) {
			distances[i] = Math.sqrt((swarm[i].x - x) * (swarm[i].x - x) + (swarm[i].y - y) * (swarm[i].y - y));
			swarmBearing += swarm[i].bearing;
		}
		
		swarmBearing /= swarm.length;
		
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
		
		
		double xComp = 0;
		double yComp = 0;
		
		// Add components of vectors to neighbours.
		for (int i = 0; i < NUM_NEIGHBOURS; i++) {
			xComp += swarm[neighbours[i]].x - x;
			yComp += swarm[neighbours[i]].y - y;
		}
		
		// Find average vector.
		xComp /= swarm.length;
		yComp /= swarm.length;
		
		// Add component in direction of average swarm bearing.
		xComp += 200.0 * Math.cos(swarmBearing);
		yComp += 200.0 * Math.sin(swarmBearing);
		
		// Add components of the home vector.
		xComp += (homeX - x) / 2.0;
		yComp += (homeY - y) / 2.0;
		
		// Calculate length of vector currently.
		double length = Math.sqrt(xComp * xComp + yComp * yComp);
		
		// Calculate components and length of vector pointing away from nearest neighbour.
		double xC = x - swarm[neighbours[0]].x;
		double yC = y - swarm[neighbours[0]].y;
		double lC = Math.sqrt(xC * xC + yC * yC);
		
		// Add component pointing away from nearest neighbour.
		xComp += xC / lC * length / neighbourDist[0] * 6.0;
		yComp += yC / lC * length / neighbourDist[0] * 6.0;
		
		// Calculate angle of movement vector.
		double angle = Math.atan2(yComp, xComp);
		
		// Calculate new bearing.
		if (bearing < angle)
			newBearing = (bearing + Math.min(MAX_TURN_ANGLE, angle - bearing)) % (2 * Math.PI);
		else
			newBearing = (bearing - Math.min(MAX_TURN_ANGLE, bearing - angle)) % (2 * Math.PI);
		
		// Add small random variation to the bearing
		newBearing += Math.random() * 0.2 - 0.1;

		// Calculate new x and y coordinates.
		newX = x + speed * Math.cos(newBearing);
		newY = y + speed * Math.sin(newBearing);
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
