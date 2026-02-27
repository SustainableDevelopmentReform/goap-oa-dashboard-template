import type { Feature, FeatureCollection, MultiPolygon, Point, Polygon } from "geojson";

export type EcosystemKey =
  | "coralReef"
  | "reefFlats"
  | "seagrass"
  | "mangroves"
  | "algae"
  | "tidalWetlands"
  | "other";

export type ConfidenceLevel = "low" | "medium" | "high";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type EcosystemBreakdown = Record<EcosystemKey, number | null>;

export type SocialIndicatorId =
  | "fishingIncomeDependency"
  | "foodSecurityDependence"
  | "stormSurgeExposure"
  | "tourismEmploymentShare"
  | "youthPopulationShare"
  | "populationSize"
  | "weeklyFishSeafoodSpend"
  | "coastalDamageExposure";

export type SocialTier = "low" | "moderate" | "high";

export type SocialIconId = "boat" | "meal" | "wave" | "tourism" | "youth" | "population" | "currency" | "damage";

export type SocialUnit = "percentage" | "number" | "currency";

export interface SocialTierLabels {
  low: string;
  moderate: string;
  high: string;
}

export interface SocialIndicatorDefinition {
  id: SocialIndicatorId;
  label: string;
  shortLabel?: string | null;
  description: string;
  icon: SocialIconId;
  unit: SocialUnit;
  tierLabels?: SocialTierLabels;
}

export interface SocialMetric {
  value: number | null;
  tier: SocialTier | null;
  iconCount?: 1 | 2 | 3 | null;
  percentile?: number | null;
}

export interface NationalSocialAtoll {
  id: string;
  name: string;
  metrics: Record<SocialIndicatorId, SocialMetric>;
  isSpotlight?: boolean;
  population?: number | null;
}

export interface NationalSocialData {
  lastUpdated: string;
  spotlightAtollId: string;
  indicators: SocialIndicatorDefinition[];
  atolls: NationalSocialAtoll[];
  notes?: string | null;
}

export interface IslandPopulationDistribution {
  total: number;
  males: number | null;
  females: number | null;
  ageDistribution: {
    age0to14: number | null;
    age15to64: number | null;
    age65plus: number | null;
  };
}

export interface IslandSocioeconomicProfile {
  totalPopulation: number | null;
  households: number | null;
  femaleShare: number | null;
  dependencyRatio: number | null;
  disabilityShare: number | null;
  unemploymentShare: number | null;
  tourismWorkers: number | null;
  tourismShare: number | null;
  fishingHouseholds: number | null;
  oceanResourcesShare: number | null;
}

export interface SubnationalSocialIsland {
  id: string;
  name: string;
  atollId: string;
  metrics: Record<SocialIndicatorId, SocialMetric>;
  population?: number | null;
  populationDistribution?: IslandPopulationDistribution | null;
  socioeconomic?: IslandSocioeconomicProfile | null;
}

export interface SubnationalSocialData {
  lastUpdated: string;
  atollId: string;
  atollName: string;
  indicators: SocialIndicatorDefinition[];
  atollAverages: Record<SocialIndicatorId, SocialMetric>;
  islands: SubnationalSocialIsland[];
  notes?: string | null;
}

export interface NationalMetadata {
  dataSource: string;
  methodology: string;
  referenceYear: number;
  spatialResolution?: string | null;
  uncertaintyRange?: string | null;
}

export interface EcosystemServiceValue {
  year: number;
  value: number;
}

export interface EcosystemServiceMetric {
  id: string;
  label: string;
  unit: string;
  values: EcosystemServiceValue[];
}

export interface EcosystemServiceGroup {
  ecosystem: string;
  ecosystemLabel: string;
  metrics: EcosystemServiceMetric[];
}

export interface EcosystemServicesMetadata {
  dataSource?: string | null;
  methodology?: string | null;
  notes?: string | null;
}

export interface EcosystemServicesData {
  metadata?: EcosystemServicesMetadata;
  ecosystems: EcosystemServiceGroup[];
}

export interface NaturalCapitalCategory {
  id: string;
  label: string;
  unit: string;
  provision: number;
  usage: Record<string, number>;
}

export interface NaturalCapitalMetadata {
  dataSource?: string | null;
  notes?: string | null;
}

export interface NaturalCapitalData {
  year: number;
  title: string;
  categories: NaturalCapitalCategory[];
  clusters: Record<string, string>;
  metadata?: NaturalCapitalMetadata;
}

export interface NationalData {
  countryName: string;
  countryCode: string;
  lastUpdated: string;
  ecosystems: EcosystemBreakdown;
  metadata: NationalMetadata;
  ecosystemServices?: EcosystemServicesData;
  naturalCapital?: NaturalCapitalData;
  social?: NationalSocialData;
}

export interface SubnationalArea {
  id: string;
  name: string;
  type: string;
  ecosystems: EcosystemBreakdown;
  coordinates?: Coordinates;
  description?: string | null;
}

export interface SubnationalData {
  areas: SubnationalArea[];
  social?: SubnationalSocialData;
}

export interface TimeSeriesPoint {
  year: number;
  value: number;
  confidence: ConfidenceLevel;
}

export interface TimeSeriesSeries {
  name: string;
  displayName: string;
  unit: string;
  data: TimeSeriesPoint[];
}

export interface TimeSeriesMetadata {
  dataSource: string;
  methodology: string;
  notes?: string | null;
}

export interface TimeSeriesData {
  startYear: number;
  endYear: number;
  ecosystems: TimeSeriesSeries[];
  metadata: TimeSeriesMetadata;
}

export interface EconomicIndicator {
  value: number;
  unit: string;
  description: string;
}

export interface EconomicIndicatorsMap {
  [key: string]: EconomicIndicator;
}

export interface EconomicSector {
  name: string;
  value: number;
  unit: string;
  percentage?: number | null;
}

export interface EconomicMetadata {
  dataSource: string;
  methodology: string;
  notes?: string | null;
}

export type EconomicSeriesStatus = "final" | "revised" | "provisional";

export interface EconomicSeriesPoint {
  year: number;
  value: number;
  status?: EconomicSeriesStatus;
}

export interface EconomicIndustrySeries {
  id: string;
  name: string;
  group?: string | null;
  series: EconomicSeriesPoint[];
}

export interface EconomicTimeSeries {
  title: string;
  unit: string;
  description?: string | null;
  industries: EconomicIndustrySeries[];
  totals?: EconomicSeriesPoint[];
}

export interface EconomicData {
  lastUpdated: string;
  referenceYear: number;
  currency: string;
  indicators: EconomicIndicatorsMap;
  sectors: EconomicSector[];
  metadata: EconomicMetadata;
  gdpGrowth?: EconomicTimeSeries;
  tourismGva?: EconomicTimeSeries;
}

export type PrivacyLevel = "public" | "masked" | "private";

export type ReadinessStage =
  | "design"
  | "baseline"
  | "triggers-defined"
  | "capitalised"
  | "paying"
  | "closed";

export interface ResultsMetricPoint {
  value?: number | null;
  display?: string | null;
  year?: number | null;
  note?: string | null;
}

export type ResultsMetricStatus = "not-started" | "on-track" | "at-risk" | "achieved";

export interface ResultsMetric {
  id: string;
  label: string;
  unit?: string | null;
  baseline?: ResultsMetricPoint;
  current?: ResultsMetricPoint;
  target?: ResultsMetricPoint;
  status?: ResultsMetricStatus;
  privacy?: PrivacyLevel;
}

export interface ResultsTrigger {
  id: string;
  label: string;
  indicator: string;
  target: string;
  status: ResultsMetricStatus;
  nextDue?: string | null;
  evidence?: string | null;
}

export interface ResultsVerification {
  method: string;
  cadence: string;
  standard?: string | null;
  automated?: boolean;
}

export interface ResultsInstrument {
  type: string;
  capitalSource?: string | null;
  capitalAmount?: string | null;
  privacy?: PrivacyLevel;
  governance?: string | null;
  description?: string | null;
}

export interface ResultsDisbursement {
  nextWindow?: string | null;
  status?: string | null;
  evidenceRequired?: string | null;
}

export interface ResultsPilot {
  id: string;
  name: string;
  areaId?: string | null;
  readinessStage: ReadinessStage;
  readinessNote?: string | null;
  instrument: ResultsInstrument;
  nbSolutionFocus?: string[];
  baselineYear?: number | null;
  summary?: string | null;
  verification?: ResultsVerification;
  metrics?: ResultsMetric[];
  triggers?: ResultsTrigger[];
  disbursement?: ResultsDisbursement;
  partners?: string[];
  communities?: string[];
  replication?: string[];
}

export interface ResultsIntro {
  title: string;
  summary: string;
  policyHooks?: string[];
  lastUpdated?: string | null;
}

export interface ResultsReadinessStage {
  id: ReadinessStage;
  label: string;
  description?: string;
}

export interface ResultsData {
  intro: ResultsIntro;
  pilots: ResultsPilot[];
  readinessStages?: ResultsReadinessStage[];
}

export interface NarrativeImage {
  filename: string;
  caption?: string | null;
  altText: string;
  position?: "left" | "center" | "right";
}

export interface NarrativeSection {
  id: string;
  title: string;
  content: string;
  order: number;
  images: NarrativeImage[];
}

export interface NarrativeIntro {
  title: string;
  content: string;
  lastUpdated: string;
}

export interface NarrativeFooter {
  attribution: string;
  dataSourceCitation: string;
  contactInfo?: string | null;
}

export interface NarrativeData {
  introduction: NarrativeIntro;
  sections: NarrativeSection[];
  footer: NarrativeFooter;
}

export interface MapViewConfig {
  center: Coordinates;
  defaultZoom: number;
  maxZoom: number;
  minZoom: number;
  baseMapStyle: string;
}

export interface SpatialFeatureProperties {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export type PolygonLikeGeometry = Polygon | MultiPolygon;

export type SpatialFeature = Feature<PolygonLikeGeometry, SpatialFeatureProperties>;

export interface SpatialBoundaryCollection {
  national: SpatialFeature;
  subnational: FeatureCollection<PolygonLikeGeometry, SpatialFeatureProperties>;
}

export interface SpatialLocation {
  id: string;
  name: string;
  type: string;
  coordinates: Coordinates;
  description?: string | null;
}

export interface GeeAppConfig {
  url: string;
  title: string;
  description?: string | null;
}

export interface SpatialLegendItem {
  ecosystem: EcosystemKey;
  color: string;
  label: string;
}

export interface EcosystemRasterLayer {
  id: string;
  label: string;
  source: string;
  color: string;
  value?: number;
  opacity?: number;
  description?: string | null;
}

export interface MapOverlayConfig {
  id: string;
  name: string;
  type: "geojson" | "vector";
  url: string;
  fillColor?: string;
  outlineColor?: string;
  opacity?: number;
}

export interface SpatialConfig {
  mapConfig: MapViewConfig;
  boundaries: SpatialBoundaryCollection;
  locations: SpatialLocation[];
  geeApp: GeeAppConfig;
  legend: SpatialLegendItem[];
  ecosystemRasters?: EcosystemRasterLayer[];
  overlays?: MapOverlayConfig[];
}

export interface Vessel {
  id: string;
  mmsi: string;
  name: string;
  flag: string;
  type: string;
  grossTonnage: number;
  netTonnage?: number;
  yearBuilt?: number;
  status: "active" | "inactive" | "planned";
  owner?: string;
  operator?: string;
  homePort?: string;
  crewCount?: number;
  domesticCrew?: number;
  lastPortCall?: string;
}

export interface MaritimeFleet {
  vessels: Vessel[];
}

export interface CrewMember {
  id: string;
  rank: string;
  nationality: string;
  certifications?: string[];
  status: "active" | "inactive";
}

export interface CrewData {
  crew: CrewMember[];
  rankDistribution: Record<string, number>;
  nationalityBreakdown: Record<string, number>;
  metadata: {
    totalCrewCount: number;
    lastUpdated: string;
    source: string;
  };
}

export interface PortTraffic {
  id: string;
  name: string;
  country: string;
  arrivals: number;
  departures: number;
  cargoVolume: number;
  cargoUnit: string;
  vesselTypes: Record<string, number>;
}

export interface TrafficData {
  ports: PortTraffic[];
  monthlyTrend: Array<{
    month: string;
    arrivals: number;
    departures: number;
    cargo: number;
  }>;
  metadata: {
    country: string;
    dataYear: number;
    lastUpdated: string;
  };
}

export interface MaritimeKPI {
  value: number;
  unit: string;
  description: string;
  asGdpPercentage?: number;
}

export interface MaritimeOverview {
  metadata: {
    country: string;
    dataYear: number;
    lastUpdated: string;
    source: string;
    reportingAcronym?: string;
    notes?: string;
  };
  kpis: Record<string, MaritimeKPI>;
  economic?: {
    fleetValue?: MaritimeKPI;
    annualRevenue?: MaritimeKPI;
    employmentContribution?: MaritimeKPI;
  };
}

export interface SocioeconomicData {
  lastUpdated: string;
  atollId: string;
  atollName: string;
  indicators: SocialIndicatorDefinition[];
  atollAverages: Record<SocialIndicatorId, SocialMetric>;
  islands: Array<{
    id: string;
    name: string;
    atollId: string;
    population: number;
    metrics: Record<SocialIndicatorId, SocialMetric>;
    populationDistribution?: IslandPopulationDistribution | null;
    socioeconomic: IslandSocioeconomicProfile;
  }>;
  notes?: string;
}

export interface StrategicMetrics {
  fleetValue: number;
  fleetValuePerVessel: number;
  fleetValueAsGdpPercent: number;
  medianFleetAge: number;
  totalRevenue: number;
  crewWageCosts: number;
  maintenanceCosts: number;
}

export interface StrategicData {
  currency: string;
  lastUpdated: string;
  strategic: {
    metrics: StrategicMetrics;
    ageDistribution: Array<{ years: number; count: number }>;
    depreciation: Array<{ year: number; value: number }>;
    composition: Array<{ type: string; count: number }>;
    workforce: { low: number; mid: number; high: number };
    revenue: Array<{ source: string; value: number }>;
  };
}

export interface DashboardDataBundle {
  national: NationalData;
  subnational: SubnationalData;
  timeseries: TimeSeriesData;
  economic: EconomicData;
  narrative: NarrativeData;
  spatial: SpatialConfig;
  // Optional modules (activated by data presence)
  maritime?: {
    overview: MaritimeOverview;
    fleet: MaritimeFleet;
  } | null;
  crew?: CrewData | null;
  traffic?: TrafficData | null;
  strategic?: StrategicData | null;
  socioeconomic?: SocioeconomicData | null;
}

export type DataLoadResult = DashboardDataBundle;

export type GeoPointFeature = Feature<Point, SpatialFeatureProperties>;

export interface DashboardConfig {
  dataDirectory: string;
  revalidate?: number;
}
