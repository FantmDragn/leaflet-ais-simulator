// src/utils/routeUtils.js

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
