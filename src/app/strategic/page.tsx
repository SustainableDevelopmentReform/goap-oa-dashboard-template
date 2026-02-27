import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { StrategicDashboard } from "@/components/maritime/StrategicDashboard";
import { loadDashboardData } from "@/lib/dataLoader";

export const metadata = {
  title: "Strategic Maritime View | GOAP Ocean Accounts",
  description:
    "Strategic fleet value, depreciation, and workforce analytics for maritime planning.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StrategicPage() {
  const { strategic, narrative } = await loadDashboardData();

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-12">
        {strategic ? (
          <StrategicDashboard data={strategic} />
        ) : (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            Strategic maritime data is not configured for this dataset yet.
          </section>
        )}
      </main>
      <Footer footer={narrative.footer} />
    </>
  );
}
