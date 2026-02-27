"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import type { Vessel } from "@/types";

interface VesselRegistryProps {
  vessels: Vessel[];
}

const statusClasses: Record<Vessel["status"], string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-200 text-slate-700",
  planned: "bg-amber-100 text-amber-700",
};

const formatStatus = (status: Vessel["status"]) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const formatTonnage = (value: number | undefined) => {
  if (typeof value !== "number") {
    return "—";
  }
  return value.toLocaleString();
};

const hasTerm = (vessel: Vessel, term: string) => {
  if (!term) {
    return true;
  }
  const haystack = [
    vessel.name,
    vessel.type,
    vessel.flag,
    vessel.homePort,
    vessel.owner,
    vessel.operator,
    vessel.mmsi,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
};

const matchStatus = (vessel: Vessel, status: Vessel["status"] | "all") =>
  status === "all" ? true : vessel.status === status;

export function VesselRegistry({ vessels }: VesselRegistryProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Vessel["status"] | "all">("all");
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      vessels.filter(
        (vessel) => hasTerm(vessel, normalizedQuery) && matchStatus(vessel, status),
      ),
    [normalizedQuery, status, vessels],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 md:flex-row md:items-end md:justify-between">
        <label className="flex w-full flex-col gap-1 text-sm font-medium text-slate-600 md:max-w-sm">
          Search vessels
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder="Name, port, type, owner, MMSI..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as Vessel["status"] | "all")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="planned">Planned</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          No vessels match the current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vessel) => (
            <button
              key={vessel.id}
              type="button"
              onClick={() => setSelectedVessel(vessel)}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-slate-900">{vessel.name}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {vessel.type}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusClasses[vessel.status]}`}
                >
                  {formatStatus(vessel.status)}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>
                  <dt className="font-semibold text-slate-500">Flag</dt>
                  <dd>{vessel.flag}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Gross Tonnage</dt>
                  <dd>{formatTonnage(vessel.grossTonnage)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Crew</dt>
                  <dd>{vessel.crewCount ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Domestic crew</dt>
                  <dd>{vessel.domesticCrew ?? "—"}</dd>
                </div>
              </dl>

              <p className="text-xs text-slate-500">
                Home port: <span className="font-semibold text-slate-700">{vessel.homePort ?? "Not listed"}</span>
              </p>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(selectedVessel)}
        title={selectedVessel ? `${selectedVessel.name} vessel details` : "Vessel details"}
        onClose={() => setSelectedVessel(null)}
      >
        {selectedVessel ? <VesselDetail vessel={selectedVessel} /> : null}
      </Modal>
    </div>
  );
}

function VesselDetail({ vessel }: { vessel: Vessel }) {
  const domesticShare =
    typeof vessel.crewCount === "number" && vessel.crewCount > 0 && typeof vessel.domesticCrew === "number"
      ? (vessel.domesticCrew / vessel.crewCount) * 100
      : null;

  return (
    <div className="space-y-4 text-sm text-slate-700">
      <dl className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <DetailItem label="MMSI" value={vessel.mmsi} />
        <DetailItem label="Flag" value={vessel.flag} />
        <DetailItem label="Type" value={vessel.type} />
        <DetailItem label="Status" value={formatStatus(vessel.status)} />
        <DetailItem label="Gross tonnage" value={formatTonnage(vessel.grossTonnage)} />
        <DetailItem label="Net tonnage" value={formatTonnage(vessel.netTonnage)} />
        <DetailItem label="Year built" value={vessel.yearBuilt ? String(vessel.yearBuilt) : "—"} />
        <DetailItem label="Last port call" value={vessel.lastPortCall ?? "—"} />
      </dl>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Crew snapshot</p>
        <p className="mt-2 text-sm">
          Crew onboard: <span className="font-semibold text-slate-900">{vessel.crewCount ?? "—"}</span>
        </p>
        <p className="text-sm">
          Domestic crew: <span className="font-semibold text-slate-900">{vessel.domesticCrew ?? "—"}</span>
          {domesticShare != null ? ` (${domesticShare.toFixed(1)}%)` : ""}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Operator details</p>
        <p className="mt-2 text-sm">
          Owner: <span className="font-semibold text-slate-900">{vessel.owner ?? "Not listed"}</span>
        </p>
        <p className="text-sm">
          Operator: <span className="font-semibold text-slate-900">{vessel.operator ?? "Not listed"}</span>
        </p>
        <p className="text-sm">
          Home port: <span className="font-semibold text-slate-900">{vessel.homePort ?? "Not listed"}</span>
        </p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
