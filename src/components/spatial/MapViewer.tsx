"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import maplibregl from "maplibre-gl";
import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";
import { LayerControl } from "./LayerControl";
import { MiniEcosystemDonut } from "./MiniEcosystemDonut";
import { formatNumber } from "@/lib/format";
import { ECOSYSTEM_COLORS, ECOSYSTEM_LABELS } from "@/lib/constants";
import {
  buildLocationAreaIndex,
  getFeatureId,
} from "@/lib/spatialUtils";
import type {
  SpatialConfig,
  SpatialFeatureProperties,
  SpatialLocation,
  SubnationalArea,
  SubnationalData,
} from "@/types";

interface MapViewerProps {
  spatial: SpatialConfig;
  subnational: SubnationalData;
  initialAreaId?: string | null;
}

type HoverState = {
  id?: string;
  name?: string;
  areaKm2?: number;
};

const NATIONAL_LAYER_ID = "national-boundary";
const SUBNATIONAL_FILL_LAYER_ID = "subnational-fill";
const SUBNATIONAL_OUTLINE_LAYER_ID = "subnational-outline";
const RASTER_LAYER_PREFIX = "raster-placeholder-";
const OVERLAY_SOURCE_PREFIX = "overlay-source-";
const OVERLAY_FILL_PREFIX = "overlay-fill-";
const OVERLAY_OUTLINE_PREFIX = "overlay-outline-";

const computeBounds = (feature: Feature<Polygon | MultiPolygon>) => {
  const bounds = new maplibregl.LngLatBounds();

  const extendCoordinates = (coords: unknown): void => {
    if (!Array.isArray(coords) || coords.length === 0) {
      return;
    }

    const first = coords[0];
    if (
      coords.length >= 2 &&
      typeof first === "number" &&
      typeof coords[1] === "number"
    ) {
      bounds.extend([first, coords[1] as number]);
      return;
    }

    (coords as unknown[]).forEach((coord) => {
      extendCoordinates(coord);
    });
  };

  extendCoordinates(feature.geometry.coordinates);
  return bounds;
};

export function MapViewer({ spatial, subnational, initialAreaId }: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const hoveredFeatureIdRef = useRef<string | null>(null);
  const selectedFeatureIdRef = useRef<string | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const popupContainerRef = useRef<HTMLDivElement | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const pendingPopupLocationRef = useRef<maplibregl.LngLat | null>(null);
  const activeMarkerPopupRef = useRef<maplibregl.Popup | null>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [showSubnational, setShowSubnational] = useState(true);
  const [showLocations, setShowLocations] = useState(true);
  const [visibleRasterIds, setVisibleRasterIds] = useState<string[]>(
    () => spatial.ecosystemRasters?.map((layer) => layer.id) ?? [],
  );
  const [visibleOverlayIds, setVisibleOverlayIds] = useState<string[]>(
    () => spatial.overlays?.map((layer) => layer.id) ?? [],
  );
  const [hoveredFeature, setHoveredFeature] = useState<HoverState | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(
    initialAreaId ?? null,
  );

  const rasterLayers = useMemo(
    () => spatial.ecosystemRasters ?? [],
    [spatial.ecosystemRasters],
  );
  const overlayLayers = useMemo(
    () => spatial.overlays ?? [],
    [spatial.overlays],
  );

  const toggleRasterLayer = useCallback((layerId: string, checked: boolean) => {
    setVisibleRasterIds((previous) =>
      checked ? [...new Set([...previous, layerId])] : previous.filter((id) => id !== layerId),
    );
  }, []);

  const toggleOverlayLayer = useCallback((layerId: string, checked: boolean) => {
    setVisibleOverlayIds((previous) =>
      checked ? [...new Set([...previous, layerId])] : previous.filter((id) => id !== layerId),
    );
  }, []);

  const center = useMemo(
    () =>
      [
        spatial.mapConfig.center.longitude,
        spatial.mapConfig.center.latitude,
      ] as [number, number],
    [spatial.mapConfig.center.latitude, spatial.mapConfig.center.longitude],
  );

  const subnationalFeatures = useMemo(
    () =>
      spatial.boundaries.subnational.features.map((feature) => {
        const typedFeature = feature as Feature<
          Polygon | MultiPolygon,
          SpatialFeatureProperties
        >;
        return {
          ...typedFeature,
          id: getFeatureId(typedFeature) ?? undefined,
        };
      }),
    [spatial.boundaries.subnational.features],
  );

  const subnationalCollection = useMemo(
    () =>
      ({
        ...spatial.boundaries.subnational,
        features: subnationalFeatures,
      }) as FeatureCollection<Polygon | MultiPolygon, SpatialFeatureProperties>,
    [spatial.boundaries.subnational, subnationalFeatures],
  );

  const featureById = useMemo(() => {
    const mapping = new Map<string, Feature<Polygon | MultiPolygon>>();
    subnationalFeatures.forEach((feature) => {
      const typedFeature = feature as Feature<
        Polygon | MultiPolygon,
        SpatialFeatureProperties
      >;
      const id = getFeatureId(typedFeature);
      if (!id) {
        return;
      }
      mapping.set(id, typedFeature);
    });
    return mapping;
  }, [subnationalFeatures]);

  const subnationalAreaById = useMemo(() => {
    const mapping = new Map<string, SubnationalArea>();
    subnational.areas.forEach((area) => {
      mapping.set(area.id, area);
    });
    return mapping;
  }, [subnational.areas]);

  const locationIndex = useMemo(
    () => buildLocationAreaIndex(spatial.locations, subnationalCollection),
    [spatial.locations, subnationalCollection],
  );

  const locationsByAreaId = locationIndex.areaIdToLocations;

  const resolveFeatureById = useCallback(
    (featureId: string | null | undefined) =>
      (featureId ? featureById.get(featureId) ?? null : null),
    [featureById],
  );

  const openAreaPopup = useCallback(
    (featureId: string, lngLat: maplibregl.LngLatLike) => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      const area = subnationalAreaById.get(featureId);
      if (!area) {
        console.error(`[MapViewer] Cannot find area data for featureId: ${featureId}`);
        return;
      }

      if (!popupRef.current) {
        popupRef.current = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: true,
          offset: 18,
          maxWidth: "340px",
        });

        // When polygon popup closes, clear the selected area so it can be reopened
        popupRef.current.on('close', () => {
          setSelectedAreaId(null);
        });
      }

      let container = popupContainerRef.current;
      if (!container) {
        container = document.createElement("div");
        popupContainerRef.current = container;
      }

      popupRef.current.setDOMContent(container);

      if (!popupRootRef.current) {
        popupRootRef.current = createRoot(container);
      }

      const relatedLocations = locationsByAreaId.get(featureId) ?? [];

      popupRootRef.current.render(
        <MapAreaPopup area={area} locations={relatedLocations} />,
      );

      popupRef.current.setLngLat(lngLat).addTo(map);
    },
    [locationsByAreaId, subnationalAreaById],
  );

  useEffect(() => {
    if (typeof initialAreaId === "undefined") {
      return;
    }
    setSelectedAreaId(initialAreaId ?? null);
  }, [initialAreaId]);

  useEffect(() => {
    setVisibleRasterIds(rasterLayers.map((layer) => layer.id));
    setVisibleOverlayIds(overlayLayers.map((layer) => layer.id));
  }, [overlayLayers, rasterLayers]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: spatial.mapConfig.baseMapStyle,
      center,
      zoom: spatial.mapConfig.defaultZoom,
      maxZoom: spatial.mapConfig.maxZoom,
      minZoom: spatial.mapConfig.minZoom,
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right",
    );

    const handleLoad = () => {
      setIsMapReady(true);

      map.addSource("national", {
        type: "geojson",
        data: spatial.boundaries.national,
      });
      map.addLayer({
        id: NATIONAL_LAYER_ID,
        type: "line",
        source: "national",
        paint: {
          "line-color": "#0f172a",
          "line-width": 2.4,
        },
      });

      map.addSource("subnational", {
        type: "geojson",
        data: subnationalCollection,
      });

      map.addLayer({
        id: SUBNATIONAL_FILL_LAYER_ID,
        type: "fill",
        source: "subnational",
        paint: {
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#0077be",
            ["boolean", ["feature-state", "hovered"], false],
            "#00a8e8",
            ["coalesce", ["get", "fill"], "#38bdf8"],
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            0.65,
            ["boolean", ["feature-state", "hovered"], false],
            0.5,
            0.3,
          ],
        },
      });

      map.addLayer({
        id: SUBNATIONAL_OUTLINE_LAYER_ID,
        type: "line",
        source: "subnational",
        paint: {
          "line-color": "#0f172a",
          "line-width": 1.4,
        },
      });

      rasterLayers.forEach((layer) => {
        const sourceId = `${RASTER_LAYER_PREFIX}${layer.id}-source`;
        const layerId = `${RASTER_LAYER_PREFIX}${layer.id}`;

        map.addSource(sourceId, {
          type: "geojson",
          data: subnationalCollection,
        });

        map.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": layer.color,
            "fill-opacity": layer.opacity ?? 0.18,
          },
          layout: { visibility: "visible" },
        });
      });

      const loadOverlayLayers = async () => {
        for (const overlay of overlayLayers) {
          const sourceId = `${OVERLAY_SOURCE_PREFIX}${overlay.id}`;
          const fillId = `${OVERLAY_FILL_PREFIX}${overlay.id}`;
          const outlineId = `${OVERLAY_OUTLINE_PREFIX}${overlay.id}`;

          let sourceData: maplibregl.GeoJSONSourceSpecification["data"] =
            subnationalCollection;

          if (overlay.type === "geojson") {
            try {
              const response = await fetch(overlay.url);
              if (response.ok) {
                sourceData = (await response.json()) as maplibregl.GeoJSONSourceSpecification["data"];
              }
            } catch (error) {
              console.warn(`Overlay ${overlay.id} failed to load, using fallback geometry`, error);
            }
          }

          if (!mapRef.current) {
            return;
          }

          map.addSource(sourceId, {
            type: "geojson",
            data: sourceData,
          });

          map.addLayer({
            id: fillId,
            type: "fill",
            source: sourceId,
            paint: {
              "fill-color": overlay.fillColor ?? "#4c6ef5",
              "fill-opacity": overlay.opacity ?? 0.18,
            },
            layout: { visibility: "visible" },
          });

          map.addLayer({
            id: outlineId,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": overlay.outlineColor ?? overlay.fillColor ?? "#364fc7",
              "line-width": 1.5,
            },
            layout: { visibility: "visible" },
          });
        }
      };

      void loadOverlayLayers();

      const bounds = computeBounds(
        spatial.boundaries.national as Feature<Polygon | MultiPolygon>,
      );
      if (bounds.isEmpty()) {
        map.setCenter(center);
      } else {
        map.fitBounds(bounds, { padding: 40, duration: 1000 });
      }

      const handleHover = (featureId: string | null) => {
        if (!mapRef.current) return;

        if (hoveredFeatureIdRef.current) {
          mapRef.current.setFeatureState(
            { source: "subnational", id: hoveredFeatureIdRef.current },
            { hovered: false },
          );
        }
        if (featureId) {
          mapRef.current.setFeatureState(
            { source: "subnational", id: featureId },
            { hovered: true },
          );
        }
        hoveredFeatureIdRef.current = featureId;
      };

      map.on("mousemove", SUBNATIONAL_FILL_LAYER_ID, (event) => {
        const feature = event.features?.[0];
        // Prefer properties.id (our semantic IDs) over auto-assigned numeric feature.id
        const featureId =
          (feature?.properties?.id as string | undefined) ??
          (typeof feature?.id === "string" ? feature.id : null) ??
          (typeof feature?.id === "number" ? String(feature.id) : null) ??
          null;

        if (featureId == null) {
          setHoveredFeature(null);
          handleHover(null);
          map.getCanvas().style.cursor = "";
          return;
        }

        handleHover(featureId);
        setHoveredFeature({
          id: featureId,
          name: feature?.properties?.name as string | undefined,
          areaKm2:
            typeof feature?.properties?.area_km2 === "number"
              ? feature?.properties?.area_km2
              : undefined,
        });
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", SUBNATIONAL_FILL_LAYER_ID, () => {
        handleHover(null);
        setHoveredFeature(null);
        map.getCanvas().style.cursor = "";
      });

      map.on("click", SUBNATIONAL_FILL_LAYER_ID, (event) => {
        const feature = event.features?.[0];
        // Prefer properties.id (our semantic IDs) over auto-assigned numeric feature.id
        const featureId =
          (feature?.properties?.id as string | undefined) ??
          (typeof feature?.id === "string" ? feature.id : null) ??
          (typeof feature?.id === "number" ? String(feature.id) : null) ??
          null;

        if (featureId != null) {
          setSelectedAreaId(featureId);
          setHoveredFeature({
            id: featureId,
            name: feature?.properties?.name as string | undefined,
            areaKm2:
              typeof feature?.properties?.area_km2 === "number"
                ? feature?.properties?.area_km2
                : undefined,
          });
          pendingPopupLocationRef.current = event.lngLat;
        }
      });
    };

    map.on("load", handleLoad);

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      hoveredFeatureIdRef.current = null;
      selectedFeatureIdRef.current = null;
      const popupRoot = popupRootRef.current;
      if (popupRoot) {
        const unmount = () => {
          popupRoot.unmount();
        };
        if (typeof queueMicrotask === "function") {
          queueMicrotask(unmount);
        } else {
          Promise.resolve().then(unmount);
        }
        popupRootRef.current = null;
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      popupContainerRef.current = null;
      pendingPopupLocationRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, [
    center,
    overlayLayers,
    rasterLayers,
    spatial.boundaries.national,
    spatial.mapConfig.baseMapStyle,
    spatial.mapConfig.defaultZoom,
    spatial.mapConfig.maxZoom,
    spatial.mapConfig.minZoom,
    subnationalCollection,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Close any active marker popup when removing markers
    if (activeMarkerPopupRef.current) {
      activeMarkerPopupRef.current.remove();
      activeMarkerPopupRef.current = null;
    }

    if (!showLocations) {
      return;
    }

    markersRef.current = spatial.locations.map((location) => {
      // Create marker with default styling (no custom color)
      const marker = new maplibregl.Marker().setLngLat([
        location.coordinates.longitude,
        location.coordinates.latitude,
      ]);

      // Create a simple popup with location info
      const popupHTML = `
        <div style="padding: 4px;">
          <strong style="display: block; margin-bottom: 4px; font-size: 14px;">${location.name}</strong>
          <p style="margin: 0; font-size: 12px; color: #64748b;">${location.type || "Monitoring site"}</p>
          ${location.description ? `<p style="margin: 4px 0 0; font-size: 12px;">${location.description}</p>` : ""}
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: true,
        closeOnMove: false,
        className: 'marker-popup',
      }).setHTML(popupHTML);

      // When this popup opens, close any other marker popup
      popup.on('open', () => {
        if (activeMarkerPopupRef.current && activeMarkerPopupRef.current !== popup) {
          activeMarkerPopupRef.current.remove();
        }
        activeMarkerPopupRef.current = popup;
      });

      // Clean up reference when popup closes
      popup.on('close', () => {
        if (activeMarkerPopupRef.current === popup) {
          activeMarkerPopupRef.current = null;
        }
      });

      // Attach popup directly to marker
      marker.setPopup(popup);

      // Make marker element explicitly clickable
      const element = marker.getElement();
      element.style.cursor = "pointer";
      element.style.pointerEvents = "auto";

      marker.addTo(map);

      return marker;
    });
  }, [isMapReady, showLocations, spatial.locations]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    const fillLayer = map.getLayer(SUBNATIONAL_FILL_LAYER_ID);
    const outlineLayer = map.getLayer(SUBNATIONAL_OUTLINE_LAYER_ID);
    const visibility = showSubnational ? "visible" : "none";

    if (fillLayer) {
      map.setLayoutProperty(SUBNATIONAL_FILL_LAYER_ID, "visibility", visibility);
    }
    if (outlineLayer) {
      map.setLayoutProperty(
        SUBNATIONAL_OUTLINE_LAYER_ID,
        "visibility",
        visibility,
      );
    }
  }, [isMapReady, showSubnational]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    rasterLayers.forEach((layer) => {
      const layerId = `${RASTER_LAYER_PREFIX}${layer.id}`;
      if (!map.getLayer(layerId)) {
        return;
      }
      map.setLayoutProperty(
        layerId,
        "visibility",
        visibleRasterIds.includes(layer.id) ? "visible" : "none",
      );
    });
  }, [isMapReady, rasterLayers, visibleRasterIds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    overlayLayers.forEach((layer) => {
      const fillId = `${OVERLAY_FILL_PREFIX}${layer.id}`;
      const outlineId = `${OVERLAY_OUTLINE_PREFIX}${layer.id}`;
      const visibility = visibleOverlayIds.includes(layer.id) ? "visible" : "none";

      if (map.getLayer(fillId)) {
        map.setLayoutProperty(fillId, "visibility", visibility);
      }
      if (map.getLayer(outlineId)) {
        map.setLayoutProperty(outlineId, "visibility", visibility);
      }
    });
  }, [isMapReady, overlayLayers, visibleOverlayIds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    if (selectedFeatureIdRef.current) {
      map.setFeatureState(
        { source: "subnational", id: selectedFeatureIdRef.current },
        { selected: false },
      );
    }

    if (selectedAreaId) {
      map.setFeatureState(
        { source: "subnational", id: selectedAreaId },
        { selected: true },
      );
    }

    selectedFeatureIdRef.current = selectedAreaId ?? null;
  }, [isMapReady, selectedAreaId]);

  useEffect(() => {
    if (!selectedAreaId || !isMapReady) {
      return;
    }

    const map = mapRef.current;
    if (!map) {
      return;
    }

    const feature = resolveFeatureById(selectedAreaId);
    if (!feature) {
      return;
    }

    const bounds = computeBounds(feature as Feature<Polygon | MultiPolygon>);
    const pendingLocation = pendingPopupLocationRef.current;
    const fallbackLocation = bounds.isEmpty()
      ? new maplibregl.LngLat(center[0], center[1])
      : bounds.getCenter();
    const popupLocation = pendingLocation ?? fallbackLocation;

    pendingPopupLocationRef.current = null;

    openAreaPopup(selectedAreaId, popupLocation);
  }, [center, isMapReady, openAreaPopup, resolveFeatureById, selectedAreaId]);

  const hoveredId = hoveredFeature?.id ?? null;

  const detailFeature = useMemo(
    () =>
      resolveFeatureById(selectedAreaId) ??
      resolveFeatureById(hoveredId),
    [hoveredId, resolveFeatureById, selectedAreaId],
  );

  const detailProperties = detailFeature?.properties;
  const detailId =
    (detailFeature?.id as string | undefined) ??
    (detailProperties?.id as string | undefined);
  const primaryLocation =
    detailId != null ? locationsByAreaId.get(detailId)?.[0] ?? null : null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <LayerControl
          title="Map layers"
          layers={[
            {
              id: "subnational",
              label: "Sub-national boundaries",
              checked: showSubnational,
              onToggle: setShowSubnational,
              type: "boundary",
            },
            {
              id: "locations",
              label: "Priority monitoring areas",
              checked: showLocations,
              onToggle: setShowLocations,
              type: "boundary",
            },
            ...rasterLayers.map((layer) => ({
              id: layer.id,
              label: layer.label,
              checked: visibleRasterIds.includes(layer.id),
              onToggle: (checked: boolean) => toggleRasterLayer(layer.id, checked),
              type: "raster" as const,
              description:
                layer.description ??
                "Raster placeholder rendered using configured color and opacity.",
            })),
            ...overlayLayers.map((layer) => ({
              id: layer.id,
              label: layer.name,
              checked: visibleOverlayIds.includes(layer.id),
              onToggle: (checked: boolean) => toggleOverlayLayer(layer.id, checked),
              type: "overlay" as const,
              description: layer.url,
            })),
          ]}
        />
        {detailProperties ? (
          <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-900">
              {primaryLocation?.name ?? detailProperties.name ?? "Area"}
            </p>
            {typeof detailProperties.area_km2 === "number" ? (
              <p className="text-xs text-slate-500">
                {detailProperties.area_km2.toLocaleString()} km²
              </p>
            ) : null}
            {detailId ? (
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-primary">
                <Link
                  href={`/#monitoring-${primaryLocation?.id ?? detailId}`}
                  className="rounded-full bg-primary-soft/60 px-3 py-1 hover:bg-primary-soft"
                >
                  See monitoring notes
                </Link>
                <Link
                  href={`/?area=${detailId}`}
                  className="rounded-full border border-primary/40 px-3 py-1 hover:bg-primary/10"
                >
                  Focus dashboard cards
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div
        ref={containerRef}
        className="h-[768px] w-full overflow-hidden rounded-[1.5rem] border border-slate-200 shadow-lg"
      />
      {rasterLayers.length > 0 ? (
        <p className="text-xs text-slate-500">
          Raster layers are shown as lightweight color overlays in this build.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        {spatial.legend.map((item) => (
          <div
            key={item.ecosystem}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1"
          >
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

interface MapAreaPopupProps {
  area: SubnationalArea;
  locations: SpatialLocation[];
}

const buildTopEcosystems = (ecosystems: SubnationalArea["ecosystems"]) =>
  Object.entries(ecosystems)
    .filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === "number" && entry[1] > 0,
    )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

const formatAreaType = (value: string | undefined) =>
  value
    ?.split(/[\s-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ") ?? "Monitoring Area";

function MapAreaPopup({ area, locations }: MapAreaPopupProps) {
  const topEcosystems = buildTopEcosystems(area.ecosystems);
  const primaryLocation = locations[0] ?? null;
  const additionalLocations = locations.slice(1);
  const typeLabel = formatAreaType(primaryLocation?.type ?? area.type);

  return (
    <div className="flex w-[300px] flex-col gap-4 rounded-3xl border border-slate-200 bg-white/95 p-4 text-sm text-slate-700 shadow-lg">
      <header className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
          Priority monitoring area
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          {primaryLocation?.name ?? area.name}
        </h3>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {typeLabel}
        </p>
      </header>

      <MiniEcosystemDonut ecosystems={area.ecosystems} />

      {(primaryLocation?.description ?? area.description) ? (
        <p className="text-sm leading-relaxed text-slate-600">
          {primaryLocation?.description ?? area.description}
        </p>
      ) : null}

      {additionalLocations.length > 0 ? (
        <ul className="rounded-2xl border border-slate-200 bg-white/90 p-3 text-xs text-slate-600">
          {additionalLocations.map((loc) => (
            <li key={loc.id} className="flex justify-between gap-2">
              <span className="font-medium text-slate-500">{loc.name}</span>
              <span className="uppercase tracking-wide">
                {formatAreaType(loc.type)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="grid gap-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600">
        {topEcosystems.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: ECOSYSTEM_COLORS[key as keyof typeof ECOSYSTEM_COLORS] }}
                aria-hidden
              />
              <dt>{ECOSYSTEM_LABELS[key as keyof typeof ECOSYSTEM_LABELS]}</dt>
            </div>
            <dd className="font-semibold text-slate-900">
              {formatNumber(value, { maximumFractionDigits: 0 })} ha
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2 text-xs font-semibold text-primary">
        <Link
          href={`/#monitoring-${primaryLocation?.id ?? area.id}`}
          className="rounded-full bg-primary-soft/60 px-3 py-1 hover:bg-primary-soft"
        >
          See monitoring notes
        </Link>
        <Link
          href={`/?area=${area.id}`}
          className="rounded-full border border-primary/40 px-3 py-1 hover:bg-primary/10"
        >
          Focus dashboard cards
        </Link>
      </div>
    </div>
  );
}
