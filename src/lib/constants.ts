import type { EcosystemKey } from "@/types";

export const ECOSYSTEM_LABELS: Record<EcosystemKey, string> = {
  coralReef: "Coral Reef",
  reefFlats: "Reef Flats",
  seagrass: "Seagrass",
  mangroves: "Mangroves",
  algae: "Algae",
  tidalWetlands: "Tidal Wetlands",
  other: "Other",
};

export const ECOSYSTEM_COLORS: Record<EcosystemKey, string> = {
  coralReef: "#87CEEB",
  reefFlats: "#FFE4B5",
  seagrass: "#228B22",
  mangroves: "#00FF00",
  algae: "#8B4513",
  tidalWetlands: "#FFB6C1",
  other: "#94a3b8",
};

export const ECOSYSTEM_ORDER: EcosystemKey[] = [
  "coralReef",
  "reefFlats",
  "seagrass",
  "mangroves",
  "algae",
  "tidalWetlands",
  "other",
];

export const CONFIDENCE_LABELS: Record<string, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};

export const DEFAULT_REVALIDATE_SECONDS = 3600;
