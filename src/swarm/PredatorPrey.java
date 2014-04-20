/**
 * PredatorPrey
 * Simulation of a predator hunting a swarm of prey.
 * @author Adam Heins
 * 2014-04-20
 */

package swarm;

import java.awt.BorderLayout;
import java.awt.Graphics;

import javax.swing.JFrame;
import javax.swing.JPanel;


public class PredatorPrey extends JPanel implements Runnable {
	
	// Serial Version UID.
	private static final long serialVersionUID = -3344046793575886157L;
	
	// Constants.
	private final int SCREEN_WIDTH = 500;
	private final int SCREEN_HEIGHT = 500;
	private final int SWARM_SIZE = 10;
	

	// The swarm of prey.
	private Prey [] swarm;
	
	// The predator hunting the prey.
	// CURRENTLY UNIMPLEMENTED.
	private Predator predator;
	
	private Thread t;
	
	
	/**
	 * Constructor.
	 */
	public PredatorPrey() {
		setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
		
		// Initialize the swarm.
		swarm = new Prey[SWARM_SIZE];
		for (int i = 0; i < SWARM_SIZE; i++) {
			swarm[i] = new Prey();
			swarm[i].generateLoc(SCREEN_WIDTH, SCREEN_HEIGHT);
		}
		
		//Initialize and start the thread
		t = new Thread(this);
		t.setPriority(Thread.MIN_PRIORITY);
		t.start();
	}


	@Override
	public void run() {
		try {
	    	while (true) {
	    		
	    		// Calculate moves for the swarm.
	    		for (int i = 0; i < SWARM_SIZE; i++)
	    			swarm[i].calculateMove(null, swarm, i, getWidth() / 2.0, getHeight() / 2.0);
	    		
	    		// Move swarm.
	    		for (int i = 0; i < SWARM_SIZE; i++)
	    			swarm[i].move();
	    		
	    		repaint ();
	    	    Thread.sleep(20);      	    	
	    	}
    	}
    	catch (InterruptedException e) {
    		e.printStackTrace();
    	}		
	}
	
	
	@Override
	public void paintComponent (Graphics g) {
		super.paintComponent(g);
		
		// Draw the swarm
		for (int i = 0; i < SWARM_SIZE; i++)
			swarm[i].draw(g);
	}
	
	/**
	 * Main method
	 * @param args
	 */
	public static void main(String[] args) {
		
		// Create new instance of the CssGridGenerator class
		PredatorPrey simulation = new PredatorPrey();
    	
		// Declare and set up the frame
		JFrame frame = new JFrame();
		frame.setSize(simulation.getWidth(),simulation.getHeight());
		frame.setVisible (true);
		frame.setDefaultCloseOperation (JFrame.EXIT_ON_CLOSE);
		frame.getContentPane ().setLayout (new BorderLayout ());
				
		// Add the panel to the frame
		frame.getContentPane ().add (simulation, BorderLayout.CENTER);
				
		frame.validate();
	}
	
	
}
