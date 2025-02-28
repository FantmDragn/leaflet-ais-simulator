// src/utils/routeUtils.js

// Convert degrees to radians
export function toRad(deg) {
    return deg * Math.PI / 180;
  }
  
  // Convert radians to degrees
  export function toDeg(rad) {
    return rad * 180 / Math.PI;
  }
  
  // Calculate the initial bearing (heading) between two coordinates
  export function calculateBearing(start, end) {
    const lat1 = toRad(start[0]);
    const lon1 = toRad(start[1]);
    const lat2 = toRad(end[0]);
    const lon2 = toRad(end[1]);
  
    const dLon = lon2 - lon1;
  
    const x = Math.sin(dLon) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
    let bearing = toDeg(Math.atan2(x, y));
    return (bearing + 360) % 360; // Normalize to 0-360 degrees
  }
  
  // Interpolates between two waypoints to generate smooth movement
  export function interpolateBetweenPoints(start, end, distancePerUpdate) {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(end[0] - start[0]);
    const dLon = toRad(end[1] - start[1]);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(start[0])) * Math.cos(toRad(end[0])) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const totalDistance = R * c;
  
    const segments = Math.ceil(totalDistance / distancePerUpdate);
  
    const interpolatedPoints = [];
    for (let i = 0; i <= segments; i++) {
      const fraction = i / segments;
      const lat = start[0] + fraction * (end[0] - start[0]);
      const lon = start[1] + fraction * (end[1] - start[1]);
      interpolatedPoints.push([lat, lon]);
    }
    return interpolatedPoints;
  }
  
  // Create detailed route with ~15m spaced waypoints
  export function generateDetailedRoute(route, speedKnot, updateIntervalMs) {
    const speedMs = speedKnot * 0.514444;
    const updateIntervalSeconds = updateIntervalMs / 1000;
    const distancePerUpdate = speedMs * updateIntervalSeconds;
  
    let detailedRoute = [];
    for (let i = 0; i < route.length - 1; i++) {
      const segmentPoints = interpolateBetweenPoints(route[i], route[i + 1], distancePerUpdate);
      if (i > 0) segmentPoints.shift(); // Avoid duplicate points
      detailedRoute.push(...segmentPoints);
    }
    return detailedRoute;
  }
  