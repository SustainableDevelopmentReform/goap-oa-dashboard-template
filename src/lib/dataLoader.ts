import "server-only";

import { cache } from "react";
import { dashboardConfig, resolveDataUrl } from "./config";
import type {
  CrewData,
  DashboardDataBundle,
  EconomicData,
  MaritimeFleet,
  MaritimeOverview,
  NarrativeData,
  NationalData,
  ResultsData,
  StrategicData,
  SocioeconomicData,
  SpatialConfig,
  SubnationalData,
  TimeSeriesData,
  TrafficData,
} from "@/types";

const readFileFromDisk = async (filePath: string): Promise<string> => {
  const [{ readFile }, { join }] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  const absolutePath = join(process.cwd(), "public", filePath);
  return readFile(absolutePath, "utf-8");
};

const loadJson = cache(async <T>(resourcePath: string): Promise<T> => {
  const relativePath = `data/${dashboardConfig.dataDirectory}/${resourcePath}`;

  if (typeof window === "undefined") {
    const raw = await readFileFromDisk(relativePath);
    return JSON.parse(raw) as T;
  }

  const response = await fetch(resolveDataUrl(resourcePath), {
    cache: "force-cache",
    next: {
      revalidate: dashboardConfig.revalidate,
      tags: ["dashboard-data"],
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load data for ${resourcePath} (${response.status})`);
  }

  return (await response.json()) as T;
});

export const loadNationalData = () => loadJson<NationalData>("national.json");
export const loadSubnationalData = () => loadJson<SubnationalData>("subnational.json");
export const loadTimeSeriesData = () => loadJson<TimeSeriesData>("timeseries.json");
export const loadEconomicData = () => loadJson<EconomicData>("economic.json");
export const loadNarrativeData = () => loadJson<NarrativeData>("narrative.json");
export const loadSpatialConfig = () => loadJson<SpatialConfig>("spatial.json");
export const loadResultsData = () => loadJson<ResultsData>("results.json");

// Maritime data loaders
export const loadMaritimeOverview = () => loadJson<MaritimeOverview>("maritime/overview.json");
export const loadMaritimeFleet = () => loadJson<MaritimeFleet>("maritime/fleet.json");
export const loadMaritimeCrew = () => loadJson<CrewData>("maritime/crew.json");
export const loadMaritimeTraffic = () => loadJson<TrafficData>("maritime/traffic.json");
export const loadMaritimeStrategic = () => loadJson<StrategicData>("maritime/strategic.json");

// Social data loader
export const loadSocioeconomicData = () => loadJson<SocioeconomicData>("socioeconomic.json");

export const loadDashboardData = cache(async (): Promise<DashboardDataBundle> => {
  const [national, subnational, timeseries, economic, narrative, spatial] =
    await Promise.all([
      loadNationalData(),
      loadSubnationalData(),
      loadTimeSeriesData(),
      loadEconomicData(),
      loadNarrativeData(),
      loadSpatialConfig(),
    ]);

  // Load optional maritime data (graceful fallback if files don't exist)
  let maritime = null;
  let crew = null;
  let traffic = null;
  let strategic = null;
  try {
    const [overview, fleet, crewData, trafficData] = await Promise.all([
      loadMaritimeOverview(),
      loadMaritimeFleet(),
      loadMaritimeCrew(),
      loadMaritimeTraffic(),
    ]);
    maritime = { overview, fleet };
    crew = crewData;
    traffic = trafficData;

    try {
      strategic = await loadMaritimeStrategic();
    } catch {
      // Strategic data is optional even when core maritime files are present
    }
  } catch {
    // Maritime data not available - that's okay, it's optional
  }

  // Load optional social data (graceful fallback if files don't exist)
  let socioeconomic = null;
  try {
    socioeconomic = await loadSocioeconomicData();
  } catch {
    // Social data not available - that's okay, it's optional
  }

  return {
    national,
    subnational,
    timeseries,
    economic,
    narrative,
    spatial,
    maritime,
    crew,
    traffic,
    strategic,
    socioeconomic,
  } satisfies DashboardDataBundle;
});
