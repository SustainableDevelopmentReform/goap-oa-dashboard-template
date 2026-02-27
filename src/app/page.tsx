import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { NationalEcosystemAccount } from "@/components/dashboard/NationalEcosystemAccount";
import { NationalEcosystemServicesAccount } from "@/components/dashboard/NationalEcosystemServicesAccount";
import { NaturalCapitalSection } from "@/components/dashboard/NaturalCapitalSection";
import { PriorityMonitoringAreas } from "@/components/dashboard/PriorityMonitoringAreas";
import { AreaSelector } from "@/components/dashboard/AreaSelector";
import { EconomicHighlights } from "@/components/dashboard/EconomicHighlights";
import { TimeSeriesChart } from "@/components/dashboard/TimeSeriesChart";
import { NarrativeSections } from "@/components/dashboard/NarrativeSections";
import { SocialDashboard } from "@/components/dashboard/social/SocialDashboard";
import { MaritimeDashboard } from "@/components/maritime/MaritimeDashboard";
import { loadDashboardData } from "@/lib/dataLoader";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const data = await loadDashboardData();
  const {
    national,
    subnational,
    economic,
    narrative,
    timeseries,
    spatial,
    maritime,
    crew,
    traffic,
    socioeconomic,
  } = data;

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const areaParamRaw = resolvedSearchParams?.area;
  const areaParam = Array.isArray(areaParamRaw) ? areaParamRaw[0] : areaParamRaw;

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-12">
        <HeroSection national={national} introduction={narrative.introduction} />

        <NationalEcosystemAccount national={national} />

        <AreaSelector subnational={subnational} initialAreaId={areaParam} />

        <PriorityMonitoringAreas subnational={subnational} spatial={spatial} />

        <TimeSeriesChart data={timeseries} />

        <EconomicHighlights economic={economic} />

        <NationalEcosystemServicesAccount services={national.ecosystemServices} countryName={national.countryName} />

        <NaturalCapitalSection naturalCapital={national.naturalCapital} />

        {/* Optional: Social Accounts Module */}
        {socioeconomic && <SocialDashboard data={socioeconomic} />}

        {/* Optional: Maritime Module */}
        {maritime && crew && traffic && (
          <MaritimeDashboard
            overview={maritime.overview}
            fleet={maritime.fleet}
            crew={crew}
            traffic={traffic}
          />
        )}

        <NarrativeSections sections={narrative.sections} />
      </main>
      <Footer footer={narrative.footer} />
    </>
  );
}
