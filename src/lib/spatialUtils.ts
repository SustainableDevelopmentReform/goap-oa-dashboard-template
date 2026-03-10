import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";
import type {
  SpatialFeatureProperties,
  SpatialLocation,
} from "@/types";

type PolygonLike = Polygon | MultiPolygon;
type PolygonFeature = Feature<PolygonLike, SpatialFeatureProperties>;

const normalizeId = (value: unknown): string | null => {
  if (value == null) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};

/**
 * Extract a feature ID, preferring semantic IDs from properties over
 * auto-assigned numeric IDs from MapLibre.
 */
export const getFeatureId = (feature: PolygonFeature): string | null => {
  // IMPORTANT: Prefer properties.id (our semantic IDs like "alpha-isle")
  // over feature.id (MapLibre's auto-assigned numeric 0, 1, 2...)
  const fromProps = normalizeId(feature.properties?.id);
  if (fromProps) {
    return fromProps;
  }

  // Fall back to feature.id only if properties.id is missing
  const direct = normalizeId(feature.id);
  if (direct) {
    return direct;
  }

  // Last resort: use the name property
  return normalizeId(feature.properties?.name);
};

type CoordinateTuple = [number, number];

const isPointInRing = (point: CoordinateTuple, ring: CoordinateTuple[]): boolean => {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersects =
      yi > point[1] !== yj > point[1] &&
      point[0] <
        ((xj - xi) * (point[1] - yi)) / ((yj - yi) || Number.EPSILON) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
};

const isPointInPolygonCoords = (
  point: CoordinateTuple,
  coordinates: CoordinateTuple[][],
): boolean => {
  if (coordinates.length === 0) {
    return false;
  }

  if (!isPointInRing(point, coordinates[0])) {
    return false;
  }

  for (let i = 1; i < coordinates.length; i += 1) {
    if (isPointInRing(point, coordinates[i])) {
      return false;
    }
  }

  return true;
};

export const isPointInPolygon = (
  point: CoordinateTuple,
  geometry: PolygonLike,
): boolean => {
  if (geometry.type === "Polygon") {
    return isPointInPolygonCoords(point, geometry.coordinates as CoordinateTuple[][]);
  }

  return geometry.coordinates.some((coords) =>
    isPointInPolygonCoords(point, coords as CoordinateTuple[][]),
  );
};

export const findContainingFeatureId = (
  featureCollection: FeatureCollection<PolygonLike, SpatialFeatureProperties>,
  point: CoordinateTuple,
): string | null => {
  for (const feature of featureCollection.features) {
    const geometry = feature.geometry;
    if (!geometry) {
      continue;
    }

    if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") {
      continue;
    }

    if (isPointInPolygon(point, geometry)) {
      const id = getFeatureId(feature as PolygonFeature);
      if (id) {
        return id;
      }
    }
  }

  return null;
};

export interface LocationAreaIndex {
  locationIdToAreaId: Map<string, string>;
  areaIdToLocations: Map<string, SpatialLocation[]>;
}

export const buildLocationAreaIndex = (
  locations: SpatialLocation[],
  featureCollection: FeatureCollection<PolygonLike, SpatialFeatureProperties>,
): LocationAreaIndex => {
  const locationIdToAreaId = new Map<string, string>();
  const areaIdToLocations = new Map<string, SpatialLocation[]>();

  for (const location of locations) {
    const point: CoordinateTuple = [
      location.coordinates.longitude,
      location.coordinates.latitude,
    ];
    const featureId = findContainingFeatureId(featureCollection, point);

    if (!featureId) {
      continue;
    }

    locationIdToAreaId.set(location.id, featureId);

    const bucket = areaIdToLocations.get(featureId) ?? [];
    bucket.push(location);
    areaIdToLocations.set(featureId, bucket);
  }

  return { locationIdToAreaId, areaIdToLocations };
};
