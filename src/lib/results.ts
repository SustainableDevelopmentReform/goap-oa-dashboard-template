import clsx from "clsx";
import type { ResultsPilot, ResultsReadinessStage } from "@/types";

export const getReadinessMeta = (
  stageId: string,
  stages: ResultsReadinessStage[],
): { label: string; color: string; description?: string } => {
  const stage = stages.find((s) => s.id === stageId);
  if (!stage) {
    return { label: stageId, color: "slate" };
  }

  const colorMap: Record<string, string> = {
    design: "slate",
    baseline: "blue",
    "triggers-defined": "amber",
    capitalised: "green",
    paying: "emerald",
    closed: "gray",
  };

  return {
    label: stage.label,
    color: colorMap[stageId] || "slate",
    description: stage.description,
  };
};

export const getTriggerSummary = (
  pilot: ResultsPilot,
): { label: string; target: string; nextDue?: string | null } | null => {
  if (!pilot.triggers?.length) {
    return null;
  }

  const nextTrigger = pilot.triggers.find((t) => t.status !== "achieved") ??
    pilot.triggers[pilot.triggers.length - 1] ?? null;

  if (!nextTrigger) {
    return null;
  }

  return {
    label: nextTrigger.label,
    target: nextTrigger.target,
    nextDue: nextTrigger.nextDue,
  };
};

export const readinessChipClass = (color: string): string => {
  return clsx(
    "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
    {
      "bg-slate-100 text-slate-700": color === "slate",
      "bg-blue-100 text-blue-700": color === "blue",
      "bg-amber-100 text-amber-700": color === "amber",
      "bg-green-100 text-green-700": color === "green",
      "bg-emerald-100 text-emerald-700": color === "emerald",
      "bg-gray-100 text-gray-700": color === "gray",
    },
  );
};

export const statusChipClass = (status: string): string => {
  return clsx(
    "inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase",
    {
      "bg-slate-100 text-slate-700": status === "not-started",
      "bg-amber-100 text-amber-700": status === "at-risk",
      "bg-blue-100 text-blue-700": status === "on-track",
      "bg-green-100 text-green-700": status === "achieved",
    },
  );
};
