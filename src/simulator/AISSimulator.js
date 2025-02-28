import { calculateBearing } from "../utils/routeUtils";

export class AISSimulator {
  constructor(routes, updateCallback, intervalMs = 2000) {
    this.routes = routes; // Already interpolated routes
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
      latitude: route[0][0], // Use detailed waypoint format
      longitude: route[0][1], // Use detailed waypoint format
      heading: route.length > 1 ? calculateBearing(route[0], route[1]) : 0, // Initial heading
    }));
  }

  startSimulation() {
    if (this.interval) return; // Prevent multiple intervals
    this.interval = setInterval(() => {
      this.ships = this.ships.map((ship) => {
        let nextWaypoint = ship.currentWaypoint + 1;
        if (nextWaypoint >= ship.route.length) {
          nextWaypoint = 0; // Loop back to start
        }

        const newLat = ship.route[nextWaypoint][0];
        const newLon = ship.route[nextWaypoint][1];
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

  stopSimulation() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
