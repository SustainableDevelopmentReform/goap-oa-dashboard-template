import { SimpleLineChart } from "@/components/shared/SimpleLineChart";
import type { StrategicData } from "@/types";

interface StrategicDashboardProps {
  data: StrategicData;
}

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const toPercent = (value: number) => `${value.toFixed(1)}%`;

export function StrategicDashboard({ data }: StrategicDashboardProps) {
  const metrics = data.strategic.metrics;

  const depreciationPoints = data.strategic.depreciation.map((entry) => ({
    year: entry.year,
    value: entry.value,
  }));

  const totalComposition = data.strategic.composition.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const workforceTotal =
    data.strategic.workforce.low +
    data.strategic.workforce.mid +
    data.strategic.workforce.high;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Maritime strategic dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Long-range fleet value, workforce, and revenue indicators.
        </p>
        <p className="mt-2 text-xs text-slate-500">Last updated: {data.lastUpdated}</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Fleet value"
          value={formatCurrency(metrics.fleetValue, data.currency)}
          helper={`${toPercent(metrics.fleetValueAsGdpPercent)} of GDP`}
        />
        <MetricCard
          label="Value per vessel"
          value={formatCurrency(metrics.fleetValuePerVessel, data.currency)}
        />
        <MetricCard label="Median fleet age" value={`${metrics.medianFleetAge} years`} />
        <MetricCard
          label="Total revenue"
          value={formatCurrency(metrics.totalRevenue, data.currency)}
          helper={`Crew wages: ${formatCurrency(metrics.crewWageCosts, data.currency)}`}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Depreciation trajectory</h2>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <SimpleLineChart points={depreciationPoints} valueLabel={`${data.currency} value`} />
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Fleet age distribution</h2>
          <div className="mt-4 space-y-2">
            {data.strategic.ageDistribution.map((item) => {
              const maxCount = Math.max(...data.strategic.ageDistribution.map((entry) => entry.count), 1);
              const width = (item.count / maxCount) * 100;
              return (
                <div key={item.years} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{item.years} years</span>
                    <span>{item.count} vessels</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Fleet composition</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {data.strategic.composition.map((item) => {
              const share = totalComposition > 0 ? (item.count / totalComposition) * 100 : 0;
              return (
                <li key={item.type} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{item.type}</span>
                    <span>{item.count} vessels</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{share.toFixed(1)}% of fleet</div>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Workforce summary</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <WorkforceCard label="Low" value={data.strategic.workforce.low} total={workforceTotal} />
            <WorkforceCard label="Mid" value={data.strategic.workforce.mid} total={workforceTotal} />
            <WorkforceCard label="High" value={data.strategic.workforce.high} total={workforceTotal} />
          </div>
          <p className="mt-3 text-xs text-slate-500">Total workforce: {workforceTotal.toLocaleString()}</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Revenue structure</h2>
        <div className="mt-4 space-y-2">
          {data.strategic.revenue.map((item) => {
            const width = metrics.totalRevenue > 0 ? (item.value / metrics.totalRevenue) * 100 : 0;
            return (
              <div key={item.source} className="space-y-1">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{item.source}</span>
                  <span>{formatCurrency(item.value, data.currency)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </article>
  );
}

function WorkforceCard({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const share = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value.toLocaleString()}</p>
      <p className="text-[11px] text-slate-500">{share.toFixed(1)}%</p>
    </div>
  );
}
