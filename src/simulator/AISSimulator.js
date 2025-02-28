import { calculateBearing } from "../utils/routeUtils";

export class AISSimulator {
  constructor(routes, updateCallback, intervalMs = 2000) {
    this.routes = routes.map(route => Array.isArray(route) ? route : []); // Ensure all routes are arrays
    this.updateCallback = updateCallback;
    this.intervalMs = intervalMs;
    this.ships = this.generateShips();
    this.interval = null;
  }

  generateShips() {
    return this.routes.map((route, index) => ({
      id: `ship-${index + 1}`,
      route,
      currentWaypoint: 0,
      latitude: route[0][0], 
      longitude: route[0][1], 
      speedOverGround: (Math.random() * 10 + 5).toFixed(2), // Add random speed
    }));
  }
  

  startSimulation() {
    if (this.interval) return; // Prevent multiple intervals

    this.interval = setInterval(() => {
      this.ships = this.ships.map((ship) => {
        if (!Array.isArray(ship.route) || ship.route.length === 0) {
          console.error(`❌ Ship ${ship.id} has an empty or invalid route!`, ship.route);
          return { ...ship, latitude: 0, longitude: 0 }; // Prevent crash
        }

        let nextWaypoint = ship.currentWaypoint + 1;

        // Loop back if at the end of the route
        if (nextWaypoint >= ship.route.length) {
          nextWaypoint = 0;
        }

        let waypoint = ship.route[nextWaypoint];

        // 🚨 FIX: Convert waypoint object `{ lat, lon }` to array `[lat, lon]` if needed
        if (waypoint && typeof waypoint === "object" && waypoint.lat !== undefined && waypoint.lon !== undefined) {
          waypoint = [waypoint.lat, waypoint.lon];
        }

        // Ensure the waypoint is valid before using it
        if (!Array.isArray(waypoint) || waypoint.length !== 2) {
          console.error(`❌ Ship ${ship.id} has an invalid waypoint!`, waypoint);
          return { ...ship, latitude: 0, longitude: 0 }; // Prevent crash
        }

        const [newLat, newLon] = waypoint;
        const heading = calculateBearing([ship.latitude, ship.longitude], [newLat, newLon]);

        return {
          ...ship,
          currentWaypoint: nextWaypoint,
          latitude: newLat,
          longitude: newLon,
          heading,
        };
      });

      this.updateCallback([...this.ships]);
    }, this.intervalMs);
  }

  resetSimulation() {
    this.stopSimulation();
    this.ships = this.generateShips();
    this.updateCallback([...this.ships]);
  }
  
  stopSimulation() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

