// GeoHash encoding for ~100m precision (geohash length 6 ≈ ±610m, length 7 ≈ ±76m)
// We use length 7 for ~100m grouping

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function encodeGeohash(lat: number, lng: number, precision = 7): string {
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let hash = '';

  let latMin = -90, latMax = 90;
  let lngMin = -180, lngMax = 180;

  while (hash.length < precision) {
    if (evenBit) {
      const lngMid = (lngMin + lngMax) / 2;
      if (lng >= lngMid) {
        idx = idx * 2 + 1;
        lngMin = lngMid;
      } else {
        idx = idx * 2;
        lngMax = lngMid;
      }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (lat >= latMid) {
        idx = idx * 2 + 1;
        latMin = latMid;
      } else {
        idx = idx * 2;
        latMax = latMid;
      }
    }
    evenBit = !evenBit;

    if (++bit === 5) {
      hash += BASE32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return hash;
}

// Get neighboring geohashes to cover edge cases near cell boundaries
export function getNeighborHashes(hash: string): string[] {
  // For simplicity, we return the hash itself.
  // The actual distance filtering is done server-side via PostGIS ST_DWithin.
  // Geohash is used only for room grouping, not for precise filtering.
  return [hash];
}
