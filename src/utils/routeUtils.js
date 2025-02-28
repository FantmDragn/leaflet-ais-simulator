// src/utils/routeUtils.js

// Convert degrees to radians
export function toRad(deg) {
  return deg * Math.PI / 180;
}

// Convert radians to degrees
export function toDeg(rad) {
  return rad * 180 / Math.PI;
}

// Calculate bearing (heading) between two points
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

// Convert object { lat, lon } to [lat, lon] array
function normalizeWaypoint(waypoint) {
  if (Array.isArray(waypoint) && waypoint.length === 2) {
    return waypoint; // Already correct
  } else if (typeof waypoint === "object" && waypoint.lat !== undefined && waypoint.lon !== undefined) {
    return [waypoint.lat, waypoint.lon]; // Convert { lat, lon } to [lat, lon]
  } else {
    console.error("❌ Invalid waypoint format!", waypoint);
    return [0, 0]; // Prevent crashes
  }
}

// 🚀 Ensure waypoints are spaced ~15m apart
export function interpolateBetweenPoints(start, end, distancePerUpdate) {
  start = normalizeWaypoint(start);
  end = normalizeWaypoint(end);

  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(end[0] - start[0]);
  const dLon = toRad(end[1] - start[1]);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(start[0])) * Math.cos(toRad(end[0])) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const totalDistance = R * c; // Total distance in meters

  if (totalDistance < distancePerUpdate) {
    return [start, end]; // If points are too close, no need for interpolation
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

// 🛠 Expand a sparse route into many small steps (~15m apart)
export function generateDetailedRoute(route, speedKnot, updateIntervalMs) {
  const speedMs = speedKnot * 0.514444; // Convert knots to meters per second
  const updateIntervalSeconds = updateIntervalMs / 1000;
  const distancePerUpdate = speedMs * updateIntervalSeconds; // Ship movement per update

  let detailedRoute = [];
  for (let i = 0; i < route.length - 1; i++) {
    const start = normalizeWaypoint(route[i]);
    const end = normalizeWaypoint(route[i + 1]);

    const segmentPoints = interpolateBetweenPoints(start, end, distancePerUpdate);

    if (i > 0) segmentPoints.shift(); // Avoid duplicate points
    detailedRoute.push(...segmentPoints);
  }

  // 🚨 Debugging: Log the number of waypoints generated
  console.log(`✅ Route expanded from ${route.length} to ${detailedRoute.length} waypoints`);

  if (detailedRoute.length === 0) {
    console.error("⚠️ generateDetailedRoute produced an empty route!");
  }

  return detailedRoute.length > 0 ? detailedRoute : [[0, 0]]; // Prevent empty routes
}
