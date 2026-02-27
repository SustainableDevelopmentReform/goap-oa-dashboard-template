"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { SimpleLineChart } from "@/components/shared/SimpleLineChart";
import type { PortTraffic, TrafficData } from "@/types";

interface PortTrafficPanelProps {
  data: TrafficData;
}

const formatNumber = (value: number) => value.toLocaleString();

export function PortTrafficPanel({ data }: PortTrafficPanelProps) {
  const [selectedPort, setSelectedPort] = useState<PortTraffic | null>(null);

  const arrivalPoints = useMemo(
    () =>
      data.monthlyTrend.map((entry, index) => ({
        year: index + 1,
        value: entry.arrivals,
      })),
    [data.monthlyTrend],
  );

  const cargoPoints = useMemo(
    () =>
      data.monthlyTrend.map((entry, index) => ({
        year: index + 1,
        value: entry.cargo,
      })),
    [data.monthlyTrend],
  );

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-800">Port traffic</h3>
        <p className="text-sm text-slate-600">
          Monthly arrivals, departures, and cargo throughput across key ports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <SimpleLineChart points={arrivalPoints} valueLabel="Monthly arrivals" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <SimpleLineChart points={cargoPoints} valueLabel="Monthly cargo volume" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {data.ports.map((port) => (
          <button
            key={port.id}
            type="button"
            onClick={() => setSelectedPort(port)}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-base font-semibold text-slate-900">{port.name}</p>
            <dl className="mt-2 grid gap-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <dt>Arrivals</dt>
                <dd className="font-semibold text-slate-900">{formatNumber(port.arrivals)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Departures</dt>
                <dd className="font-semibold text-slate-900">{formatNumber(port.departures)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Cargo</dt>
                <dd className="font-semibold text-slate-900">
                  {formatNumber(port.cargoVolume)} {port.cargoUnit}
                </dd>
              </div>
            </dl>
          </button>
        ))}
      </div>

      <Modal
        open={Boolean(selectedPort)}
        title={selectedPort ? `${selectedPort.name} traffic breakdown` : "Port breakdown"}
        onClose={() => setSelectedPort(null)}
      >
        {selectedPort ? <PortBreakdown port={selectedPort} /> : null}
      </Modal>
    </section>
  );
}

function PortBreakdown({ port }: { port: PortTraffic }) {
  const vesselTypes = Object.entries(port.vesselTypes).sort((a, b) => b[1] - a[1]);
  const total = vesselTypes.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="space-y-4 text-sm text-slate-700">
      <p>
        Total calls: <span className="font-semibold text-slate-900">{(port.arrivals + port.departures).toLocaleString()}</span>
      </p>
      <div className="space-y-2">
        {vesselTypes.map(([type, count]) => {
          const share = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={type} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{type}</span>
                <span>
                  {count.toLocaleString()} ({share.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${share}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        Cargo throughput: {port.cargoVolume.toLocaleString()} {port.cargoUnit}
      </p>
    </div>
  );
}
