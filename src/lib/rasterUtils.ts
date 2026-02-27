/**
 * Raster Layer Utilities for MapLibre GL
 *
 * Provides helpers for loading and managing ecosystem raster layers (GeoTIFF) and geographic overlays.
 */

import type { EcosystemRasterLayer, MapOverlayConfig } from "@/types";

/**
 * Normalize longitude coordinates to [0, 360) range for dateline wrapping
 * Useful for geometries that cross the International Date Line
 * @param longitude - Raw longitude coordinate
 * @returns Normalized longitude in [0, 360) range
 */
export const normalizeLongitude = (longitude: number): number => {
  let normalized = longitude;
  while (normalized < 0) {
    normalized += 360;
  }
  while (normalized >= 360) {
    normalized -= 360;
  }
  return normalized;
};

/**
 * Normalize coordinates in a geometry for dateline crossing
 * @param coords - Array of coordinates at any nesting level
 * @returns Normalized coordinates with longitudes in [0, 360) range
 */
export const normalizeGeometryCoordinates = (
  coords: unknown,
): unknown => {
  if (!Array.isArray(coords) || coords.length === 0) {
    return coords;
  }

  const first = coords[0];
  if (typeof first === "number" && typeof coords[1] === "number") {
    // This is a [lon, lat] pair
    return [normalizeLongitude(first), coords[1]];
  }

  // Recursively normalize nested arrays
  return coords.map((item: unknown) => normalizeGeometryCoordinates(item));
};

/**
 * Check if a coordinate pair is valid
 * @param longitude - Longitude coordinate
 * @param latitude - Latitude coordinate
 * @returns true if coordinates are within valid ranges
 */
export const isValidCoordinate = (longitude: number, latitude: number): boolean => {
  return longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
};

/**
 * Get layer control configuration for raster layers
 * @param rasters - Array of raster layer definitions
 * @param visibleLayers - Set of currently visible layer IDs
 * @returns Array of layer control items for UI rendering
 */
export const getRasterLayerControls = (
  rasters: EcosystemRasterLayer[],
  visibleLayers: Set<string>,
) => {
  return rasters.map((raster) => ({
    id: raster.id,
    label: raster.label,
    checked: visibleLayers.has(raster.id),
    type: "raster" as const,
  }));
};

/**
 * Get layer control configuration for overlay layers
 * @param overlays - Array of overlay layer definitions
 * @param visibleLayers - Set of currently visible layer IDs
 * @returns Array of layer control items for UI rendering
 */
export const getOverlayLayerControls = (
  overlays: MapOverlayConfig[],
  visibleLayers: Set<string>,
) => {
  return overlays.map((overlay) => ({
    id: overlay.id,
    label: overlay.name,
    checked: visibleLayers.has(overlay.id),
    type: "overlay" as const,
  }));
};

/**
 * Combine all layer controls into a single list
 * @param rasters - Array of raster layer definitions
 * @param overlays - Array of overlay layer definitions
 * @param visibleLayers - Set of currently visible layer IDs
 * @returns Combined array of all layer control items
 */
export const getAllLayerControls = (
  rasters: EcosystemRasterLayer[] | undefined,
  overlays: MapOverlayConfig[] | undefined,
  visibleLayers: Set<string>,
) => {
  const controls: Array<{ id: string; label: string; checked: boolean; type: string }> = [];

  if (rasters && rasters.length > 0) {
    controls.push(...getRasterLayerControls(rasters, visibleLayers));
  }

  if (overlays && overlays.length > 0) {
    controls.push(...getOverlayLayerControls(overlays, visibleLayers));
  }

  return controls;
};

/**
 * Get metadata for a raster layer
 * @param rasterId - Raster layer ID
 * @param rasters - Array of raster layer definitions
 * @returns Raster layer metadata or undefined
 */
export const getRasterLayerMetadata = (rasterId: string, rasters: EcosystemRasterLayer[]) => {
  return rasters.find((r) => r.id === rasterId);
};

/**
 * Get metadata for an overlay layer
 * @param overlayId - Overlay layer ID
 * @param overlays - Array of overlay layer definitions
 * @returns Overlay layer metadata or undefined
 */
export const getOverlayLayerMetadata = (overlayId: string, overlays: MapOverlayConfig[]) => {
  return overlays.find((o) => o.id === overlayId);
};

/**
 * NOTE: Full GeoTIFF rendering implementation (using maplibre-gl-raster-layer or geotiff library)
 * would be added here. The following is a stub for the integration pattern:
 *
 * ```
 * import { fromUrl } from "geotiff";
 *
 * export const createRasterImageSource = async (sourceUrl: string) => {
 *   const tiff = await fromUrl(sourceUrl);
 *   const image = await tiff.getImage();
 *   // ...convert to ImageSource for MapLibre
 * };
 * ```
 */
