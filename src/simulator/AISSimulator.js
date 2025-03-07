// AISSimulator.js - Simulates ship movements along predefined routes.
// Uses waypoints to animate ships, updating their position over time.

// Import necessary dependencies
import { calculateBearing } from "../utils/routeUtils";


// Function/Class definition
export class AISSimulator {

// Define base routes and generate random ship routes
  constructor(routes, updateCallback, intervalMs = 2000) {
    this.routes = routes.map(route => Array.isArray(route) ? route : []);
    this.updateCallback = updateCallback;
    this.intervalMs = intervalMs;
    this.ships = this.generateShips();
    this.interval = null;
    this.startSimulation();
  }

  generateShips() {
    return this.routes.flatMap((route, index) => {
      const numberOfShips = Math.floor(Math.random() * 3) + 2; // More ships per route
      
      return Array.from({ length: numberOfShips }, (_, i) => {
        let startWaypoint = Math.floor(Math.random() * route.length);
        const [startLat, startLon] = route[startWaypoint];

        return {
          id: `ship-${index + 1}-${i + 1}`,
          route,
          currentWaypoint: startWaypoint,
          latitude: startLat + (Math.random() - 0.5) * 0.75, // Slight offset
          longitude: startLon + (Math.random() - 0.5) * 0.75, // Slight offset
          speedOverGround: (Math.random() * 10 + 5).toFixed(2),
          heading: Math.random() * 360,
        };
      });
    });
  }
  
  startSimulation() {
    if (this.interval) return;


// Set an interval to update simulation data periodically
    this.interval = setInterval(() => {
      this.ships = this.ships.map((ship) => {
        if (!Array.isArray(ship.route) || ship.route.length === 0) {
          console.error(`Ship ${ship.id} has an invalid route!`);
          return { ...ship, latitude: 0, longitude: 0 };
        }

        let nextWaypoint = ship.currentWaypoint + 1;
        if (nextWaypoint >= ship.route.length) {
          nextWaypoint = 0;
        }

        let waypoint = ship.route[nextWaypoint];
        if (waypoint && waypoint.lat !== undefined && waypoint.lon !== undefined) {
          waypoint = [waypoint.lat, waypoint.lon];
        }

        if (!Array.isArray(waypoint) || waypoint.length !== 2) {
          console.error(`Ship ${ship.id} has an invalid waypoint!`);
          return { ...ship, latitude: 0, longitude: 0 };
        }

        const [newLat, newLon] = waypoint;

        return {
          ...ship,
          currentWaypoint: nextWaypoint,
          latitude: newLat,
          longitude: newLon,
          heading: ship.heading,
        };
      });

      this.updateCallback([...this.ships]);
    }, this.intervalMs);
  }

  resetSimulation() {
    this.ships = this.generateShips();
    this.updateCallback([...this.ships]);
  }
}
