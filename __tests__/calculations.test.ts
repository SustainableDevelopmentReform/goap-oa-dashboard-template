import {
  calculateEcosystemShares,
  getDominantEcosystem,
  getLatestSeriesValue,
  sumEcosystemAreas,
} from "@/lib/calculations";
import type { EcosystemBreakdown, TimeSeriesData } from "@/types";

const mockEcosystems: EcosystemBreakdown = {
  coralReef: 100,
  reefFlats: 80,
  seagrass: 60,
  mangroves: 40,
  algae: 20,
  tidalWetlands: null,
  other: null,
};

const mockTimeSeries: TimeSeriesData = {
  startYear: 2000,
  endYear: 2005,
  ecosystems: [
    {
      name: "mangroves",
      displayName: "Mangroves",
      unit: "hectares",
      data: [
        { year: 2000, value: 35, confidence: "medium" },
        { year: 2001, value: 40, confidence: "high" },
        { year: 2005, value: 45, confidence: "high" }
      ],
    },
  ],
  metadata: {
    dataSource: "Test",
    methodology: "Synthetic",
    notes: null,
  },
};

describe("calculation utilities", () => {
  it("sums ecosystem areas", () => {
    expect(sumEcosystemAreas(mockEcosystems)).toBe(300);
  });

  it("calculates ecosystem shares", () => {
    const shares = calculateEcosystemShares(mockEcosystems);
    expect(shares.coralReef).toBeCloseTo((100 / 300) * 100);
    expect(shares.mangroves).toBeCloseTo((40 / 300) * 100);
  });

  it("identifies dominant ecosystem", () => {
    const dominant = getDominantEcosystem(mockEcosystems);
    expect(dominant?.key).toBe("coralReef");
    expect(dominant?.value).toBe(100);
  });

  it("returns latest time series value", () => {
    const latest = getLatestSeriesValue("mangroves", mockTimeSeries);
    expect(latest?.year).toBe(2005);
    expect(latest?.value).toBe(45);
  });
});
