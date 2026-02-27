import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { MapViewer } from "@/components/spatial/MapViewer";
import { GEEEmbed } from "@/components/spatial/GEEEmbed";
import {
  loadNarrativeData,
  loadSpatialConfig,
  loadSubnationalData,
} from "@/lib/dataLoader";

export const metadata = {
  title: "Spatial Insights | GOAP Ocean Accounts",
  description:
    "Interactive MapLibre map and Earth Engine application for exploring spatial ocean accounts data.",
};

export default async function SpatialPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [spatial, narrative, subnational] = await Promise.all([
    loadSpatialConfig(),
    loadNarrativeData(),
    loadSubnationalData(),
  ]);

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const areaParamRaw = resolvedSearchParams?.area;
  const areaParam = Array.isArray(areaParamRaw) ? areaParamRaw[0] : areaParamRaw;

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-12">
        <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/85 p-8 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-primary/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  Beta
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Spatial Analytics
                </span>
              </div>
              <h1 className="text-4xl font-semibold text-slate-900">
                Spatial Insights
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600">
                Explore national and sub-national marine accounting areas with an
                interactive MapLibre GL JS map, and dive deeper through an embedded
                Google Earth Engine experience for temporal change analysis and
                interactive layers.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-primary">
                <Link
                  href={areaParam ? `/?area=${areaParam}` : "/"}
                  className="rounded-full border border-primary/40 px-3 py-1 hover:bg-primary/10"
                >
                  Return to dashboard overview
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary-soft/60 p-5 text-sm text-slate-700 shadow-inner">
              <p className="font-semibold text-slate-900">Spatial dataset</p>
              <p className="text-slate-500">Polygons: {spatial.boundaries.subnational.features.length}</p>
              <p className="text-slate-500">Key locations: {spatial.locations.length}</p>
            </div>
          </div>
        </section>

        <MapViewer
          spatial={spatial}
          subnational={subnational}
          initialAreaId={areaParam}
        />

        <GEEEmbed config={spatial.geeApp} />
      </main>
      <Footer footer={narrative.footer} />
    </>
  );
}
