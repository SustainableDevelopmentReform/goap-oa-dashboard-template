'use client';

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection, Geometry } from "geojson";

const MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json";
const DEFAULT_CENTER: [number, number] = [0, 0];
const DEFAULT_ZOOM = 2;

interface MapGeometryPickerProps {
  isOpen: boolean;
  initialGeometry: Geometry | null;
  onClose: () => void;
  onConfirm: (geometry: Geometry) => void;
}

type DrawMode = "point" | "polygon";

export function MapGeometryPicker({
  isOpen,
  initialGeometry,
  onClose,
  onConfirm,
}: MapGeometryPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [drawMode, setDrawMode] = useState<DrawMode>("point");
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeGeometry, setActiveGeometry] = useState<Geometry | null>(initialGeometry);
  const [draftPolygon, setDraftPolygon] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveGeometry(initialGeometry);
    setDraftPolygon([]);
    setDrawMode("point");
  }, [initialGeometry, isOpen]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      setIsLoaded(true);
      map.addSource("geometry-source", {
        type: "geojson",
        data: buildGeometryCollection(initialGeometry),
      });
      map.addLayer({
        id: "geometry-fill",
        type: "fill",
        source: "geometry-source",
        paint: {
          "fill-color": "#0077be",
          "fill-opacity": 0.18,
        },
        filter: ["==", ["geometry-type"], "Polygon"],
      });
      map.addLayer({
        id: "geometry-outline",
        type: "line",
        source: "geometry-source",
        paint: {
          "line-color": "#0077be",
          "line-width": 2,
        },
        filter: ["==", ["geometry-type"], "Polygon"],
      });
      map.addLayer({
        id: "geometry-point",
        type: "circle",
        source: "geometry-source",
        paint: {
          "circle-color": "#0077be",
          "circle-radius": 6,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
        filter: ["==", ["geometry-type"], "Point"],
      });

      map.addSource("draft-source", {
        type: "geojson",
        data: buildDraftCollection([]),
      });
      map.addLayer({
        id: "draft-line",
        type: "line",
        source: "draft-source",
        paint: {
          "line-color": "#0077be",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });
      map.addLayer({
        id: "draft-points",
        type: "circle",
        source: "draft-source",
        paint: {
          "circle-color": "#0077be",
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
        filter: ["==", ["geometry-type"], "Point"],
      });

      if (initialGeometry) {
        fitMapToGeometry(map, initialGeometry);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setIsLoaded(false);
    };
  }, [initialGeometry, isOpen]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) {
      return;
    }

    const geometrySource = mapRef.current.getSource("geometry-source") as maplibregl.GeoJSONSource | undefined;
    if (geometrySource) {
      geometrySource.setData(buildGeometryCollection(activeGeometry));
    }

    const draftSource = mapRef.current.getSource("draft-source") as maplibregl.GeoJSONSource | undefined;
    if (draftSource) {
      draftSource.setData(buildDraftCollection(draftPolygon));
    }
  }, [activeGeometry, draftPolygon, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !activeGeometry) {
      return;
    }

    fitMapToGeometry(mapRef.current, activeGeometry);
  }, [activeGeometry, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) {
      return;
    }

    const map = mapRef.current;

    const handleClick = (event: maplibregl.MapMouseEvent) => {
      const { lng, lat } = event.lngLat;

      if (drawMode === "point") {
        setActiveGeometry({
          type: "Point",
          coordinates: [lng, lat],
        });
        setDraftPolygon([]);
      } else {
        setDraftPolygon((previous) => [...previous, [lng, lat]]);
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [drawMode, isLoaded]);

  const draftCanClose = draftPolygon.length >= 3;

  const hasGeometry = Boolean(activeGeometry);

  const geometrySummary = useMemo(() => {
    if (!activeGeometry) {
      return null;
    }

    if (activeGeometry.type === "Point") {
      const [lng, lat] = activeGeometry.coordinates as [number, number];
      return `Point: ${lng.toFixed(4)}, ${lat.toFixed(4)}`;
    }

    if (activeGeometry.type === "Polygon") {
      const ring = activeGeometry.coordinates[0] ?? [];
      const summary = ring
        .slice(0, Math.min(ring.length - 1, 4))
        .map(([lng, lat], index) => `${index + 1}. ${lng.toFixed(3)}, ${lat.toFixed(3)}`)
        .join(" | ");
      const extra = Math.max(ring.length - 1 - 4, 0);
      return extra > 0 ? `Polygon vertices: ${summary} (+${extra} more)` : `Polygon vertices: ${summary}`;
    }

    return activeGeometry.type;
  }, [activeGeometry]);

  if (!isOpen) {
    return null;
  }

  const handleFinishPolygon = () => {
    if (!draftCanClose) {
      return;
    }
    const closedRing = [...draftPolygon, draftPolygon[0]];
    setActiveGeometry({
      type: "Polygon",
      coordinates: [closedRing],
    });
    setDraftPolygon([]);
  };

  const handleClear = () => {
    setActiveGeometry(null);
    setDraftPolygon([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6 backdrop-blur-sm">
      <div className="flex w-full max-w-5xl flex-col gap-5 rounded-2xl bg-white p-6 shadow-2xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Select geographic coverage</h2>
            <p className="text-sm text-slate-600">
              Choose a point for site-level data or sketch a polygon for spatial extent. Finish by confirming your selection.
            </p>
            {geometrySummary ? <p className="mt-2 text-xs font-medium text-primary">Current selection: {geometrySummary}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
          >
            Close
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <ModeButton mode="point" activeMode={drawMode} onClick={() => setDrawMode("point")}>
            Drop point
          </ModeButton>
          <ModeButton mode="polygon" activeMode={drawMode} onClick={() => setDrawMode("polygon")}>
            Draw polygon
          </ModeButton>
          <button
            type="button"
            onClick={handleFinishPolygon}
            disabled={!draftCanClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Complete polygon
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100"
          >
            Clear selection
          </button>
        </div>

        <div ref={containerRef} className="h-[28rem] w-full overflow-hidden rounded-2xl border border-slate-200" />

        <footer className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Tip: Switch to polygon mode, click around your area of interest, then choose “Complete polygon” before confirming.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!activeGeometry) {
                  return;
                }
                onConfirm(activeGeometry);
              }}
              disabled={!hasGeometry}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Use this selection
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

interface ModeButtonProps {
  mode: DrawMode;
  activeMode: DrawMode;
  onClick: () => void;
  children: React.ReactNode;
}

function ModeButton({ mode, activeMode, onClick, children }: ModeButtonProps) {
  const isActive = mode === activeMode;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        isActive
          ? "border-primary bg-primary text-white"
          : "border-slate-200 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function buildGeometryCollection(geometry: Geometry | null): FeatureCollection<Geometry> {
  if (!geometry) {
    return { type: "FeatureCollection", features: [] };
  }
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry,
        properties: {},
      },
    ],
  };
}

function buildDraftCollection(points: [number, number][]): FeatureCollection<Geometry> {
  if (points.length === 0) {
    return { type: "FeatureCollection", features: [] };
  }

  if (points.length === 1) {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: points[0],
          },
          properties: {},
        },
      ],
    };
  }

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: points,
        },
        properties: {},
      },
    ],
  };
}

function fitMapToGeometry(map: maplibregl.Map, geometry: Geometry) {
  try {
    if (geometry.type === "Point") {
      const [lng, lat] = geometry.coordinates as [number, number];
      map.easeTo({ center: [lng, lat], zoom: 9, duration: 800 });
      return;
    }

    if (geometry.type === "Polygon") {
      const bounds = new maplibregl.LngLatBounds();
      geometry.coordinates[0]?.forEach(([lng, lat]) => {
        bounds.extend([lng, lat]);
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 40, duration: 700 });
      }
      return;
    }
  } catch {
    // Ignore fit errors and leave default view.
  }
}
