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

// Generate smooth waypoints (~15m apart)
export function interpolateBetweenPoints(start, end, distancePerUpdate) {
  start = Array.isArray(start) ? start : [start.lat, start.lon];
  end = Array.isArray(end) ? end : [end.lat, end.lon];

  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(end[0] - start[0]);
  const dLon = toRad(end[1] - start[1]);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(start[0])) * Math.cos(toRad(end[0])) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const totalDistance = R * c; // Distance in meters

  if (totalDistance < distancePerUpdate) {
    return [start, end]; // Skip interpolation for very close points
  }

  const segments = Math.ceil(totalDistance / distancePerUpdate);
  const interpolatedPoints = [];

  for (let i = 0; i <= segments; i++) {
    const fraction = i / segments;
    const lat = start[0] + fraction * (end[0] - start[0]);
    const lon = start[1] + fraction * (end[1] - start[1]);
    interpolatedPoints.push([lat, lon]); // Always return [lat, lon]
  }

  return interpolatedPoints;
}

// Expand sparse waypoints into many steps (~15m apart)
export function generateDetailedRoute(route, speedKnot, updateIntervalMs) {
  const speedMs = speedKnot * 0.514444; // Convert knots to meters per second
  const updateIntervalSeconds = updateIntervalMs / 1000;
  const distancePerUpdate = speedMs * updateIntervalSeconds; // Ship movement per update

  let detailedRoute = [];
  for (let i = 0; i < route.length - 1; i++) {
    const start = Array.isArray(route[i]) ? route[i] : [route[i].lat, route[i].lon];
    const end = Array.isArray(route[i + 1]) ? route[i + 1] : [route[i + 1].lat, route[i + 1].lon];

    const segmentPoints = interpolateBetweenPoints(start, end, distancePerUpdate);

    if (segmentPoints.length > 1000) { // 🚨 Prevent excessive waypoints
    console.warn(`⚠️ Too many waypoints (${segmentPoints.length}) between ${start} and ${end}, limiting to 1000.`);
    segmentPoints.length = 1000; // Trim excess points
    }

    if (i > 0) segmentPoints.shift(); // Avoid duplicate points
    detailedRoute.push(...segmentPoints);
  }

  console.log(`✅ Route expanded from ${route.length} to ${detailedRoute.length} waypoints`);

  return detailedRoute.length > 0 ? detailedRoute : [[0, 0]]; // Prevent empty routes
}

// Generate randomized ship routes
export function generateRandomRoutes(baseRoutes, numShips) {
  let newRoutes = [];
  for (let i = 0; i < numShips; i++) {
    let offsetLat = (Math.random() - 0.5) * 0.5; // Small random offset
    let offsetLon = (Math.random() - 0.5) * 0.5; 

    const newRoute = baseRoutes.map(route =>
      route.map(({ lat, lon }) => ({
        lat: lat + offsetLat, // Slightly move ship route
        lon: lon + offsetLon,
      }))
    );

    newRoutes.push(...newRoute);
  }
  return newRoutes;
}
