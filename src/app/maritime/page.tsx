import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { MaritimeDashboard } from "@/components/maritime/MaritimeDashboard";
import { loadDashboardData } from "@/lib/dataLoader";

export const metadata = {
  title: "Maritime Dashboard | GOAP Ocean Accounts",
  description:
    "Maritime fleet, crew, and port traffic analytics in the GOAP Ocean Accounts framework.",
};

export default async function MaritimePage() {
  const { maritime, crew, traffic, narrative } = await loadDashboardData();

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-12">
        {maritime && crew && traffic ? (
          <MaritimeDashboard
            overview={maritime.overview}
            fleet={maritime.fleet}
            crew={crew}
            traffic={traffic}
          />
        ) : (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            Maritime module is not configured for this dataset yet.
          </section>
        )}
      </main>
      <Footer footer={narrative.footer} />
    </>
  );
}
