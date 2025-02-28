export class AISSimulator {
  constructor(routes, updateCallback, intervalMs = 5000) {
    this.routes = routes;
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
      latitude: route[0].lat,
      longitude: route[0].lon,
      speedOverGround: (Math.random() * 10 + 5).toFixed(2),
    }));
  }

  startSimulation() {
    if (this.interval) return; // Prevent multiple intervals
    this.interval = setInterval(() => {
      this.ships = this.ships.map((ship) => {
        let nextWaypoint = ship.currentWaypoint + 1;
        if (nextWaypoint >= ship.route.length) {
          nextWaypoint = 0;
        }
        return {
          ...ship,
          currentWaypoint: nextWaypoint,
          latitude: ship.route[nextWaypoint].lat,
          longitude: ship.route[nextWaypoint].lon,
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
