"use client";

interface LayerItem {
  id: string;
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  type?: "boundary" | "raster" | "overlay";
  description?: string;
}

interface LayerControlProps {
  layers: LayerItem[];
  title?: string;
}

const getLayerBadgeColor = (type?: string) => {
  switch (type) {
    case "raster":
      return "bg-amber-100 text-amber-700";
    case "overlay":
      return "bg-blue-100 text-blue-700";
    case "boundary":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export function LayerControl({ layers, title = "Layers" }: LayerControlProps) {
  // Group layers by type
  const groupedLayers = layers.reduce(
    (acc, layer) => {
      const type = layer.type || "boundary";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(layer);
      return acc;
    },
    {} as Record<string, LayerItem[]>,
  );

  const typeLabels: Record<string, string> = {
    boundary: "Geographic Boundaries",
    raster: "Ecosystem Rasters",
    overlay: "Spatial Overlays",
  };

  return (
    <fieldset className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
      <legend className="px-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </legend>

      {Object.entries(groupedLayers).map(([type, typeLayersToRender]) => (
        <div key={type} className="flex flex-col gap-2">
          {Object.keys(groupedLayers).length > 1 && (
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {typeLabels[type]}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {typeLayersToRender.map((layer) => (
              <label
                key={layer.id}
                className="group flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 shadow-inner hover:border-slate-300 hover:bg-slate-50 transition-colors"
                title={layer.description}
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  checked={layer.checked}
                  onChange={(event) => layer.onToggle(event.target.checked)}
                />
                <span className="flex items-center gap-2">
                  {layer.label}
                  {layer.type && (
                    <span className={`text-xs font-semibold rounded px-1.5 py-0.5 ${getLayerBadgeColor(layer.type)}`}>
                      {layer.type}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
