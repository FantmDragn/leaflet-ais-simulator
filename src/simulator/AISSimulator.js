import { calculateBearing } from "../utils/routeUtils";

export class AISSimulator {
  constructor(routes, updateCallback, intervalMs = 2000) {
    this.routes = routes.map(route => Array.isArray(route) ? route : []); // Ensure all routes are arrays
    this.updateCallback = updateCallback;
    this.intervalMs = intervalMs;
    this.ships = this.generateShips();
    this.interval = null;
    this.startSimulation(); // Automatically start simulation on load
  }

  generateShips() {
    return this.routes.flatMap((route, index) => {
      const numberOfShips = Math.random() * 3 + 2; // Increase ships per route
      return Array.from({ length: numberOfShips }, (_, i) => {
        const startWaypoint = Math.floor(Math.random() * route.length);
        const [startLat, startLon] = route[startWaypoint];

        // Add random offset to latitude and longitude to spread ships
        startLat += (Math.random() - 0.5) * 0.5; // Spread ships up to ~50km north/south
        startLon += (Math.random() - 0.5) * 0.5; // Spread ships up to ~50km east/west

        return {
          id: `ship-${index + 1}-${i + 1}`,
          route,
          currentWaypoint: startWaypoint,
          latitude: startLat,
          longitude: startLon,
          speedOverGround: (Math.random() * 10 + 5).toFixed(2),
          fixedHeading: Math.random() * 360, // Random heading assigned once per ship
        };
      });
    }).concat(
      // Additional ships 50 miles east of the existing ones
      this.routes.flatMap((route, index) => {
        const numberOfShips = Math.random() * 2 + 1; // Add extra ships eastward
        return Array.from({ length: numberOfShips }, (_, i) => {
          const startWaypoint = Math.floor(Math.random() * route.length);
          const [startLat, startLon] = route[startWaypoint];

          startLat += (Math.random() - 0.5) * 0.3; // Spread slightly
          startLon += 0.7 + Math.random() * 0.5; // Move eastward, spread even more
          
          return {
            id: `ship-east-${index + 1}-${i + 1}`,
            route,
            currentWaypoint: startWaypoint,
            latitude: startLat,
            longitude: startLon + 0.7, // Approx. 50 miles east
            speedOverGround: (Math.random() * 10 + 5).toFixed(2),
            fixedHeading: Math.random() * 360, // Random heading assigned once per ship
          };
        });
      })
    );
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

        // Convert waypoint object `{ lat, lon }` to array `[lat, lon]` if needed
        if (waypoint && typeof waypoint === "object" && waypoint.lat !== undefined && waypoint.lon !== undefined) {
          waypoint = [waypoint.lat, waypoint.lon];
        }

        // Ensure the waypoint is valid before using it
        if (!Array.isArray(waypoint) || waypoint.length !== 2) {
          console.error(`❌ Ship ${ship.id} has an invalid waypoint!`, waypoint);
          return { ...ship, latitude: 0, longitude: 0 }; // Prevent crash
        }

        const [newLat, newLon] = waypoint;

        return {
          ...ship,
          currentWaypoint: nextWaypoint,
          latitude: newLat,
          longitude: newLon,
          heading: ship.fixedHeading, // Keep the fixed heading
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
