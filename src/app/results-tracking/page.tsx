import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { ResultsTrackingContent } from "@/components/results/ResultsTrackingContent";
import {
  loadResultsData,
  loadNarrativeData,
  loadSpatialConfig,
  loadSubnationalData,
  loadNationalData,
} from "@/lib/dataLoader";

export const metadata = {
  title: "Results tracking | GOAP Ocean Accounts",
  description:
    "Results tracking for ocean-account-linked instruments, with readiness and trigger details for pilot sites.",
};

export default async function ResultsTrackingPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [results, narrative, spatial, subnational, national] = await Promise.all([
    loadResultsData(),
    loadNarrativeData(),
    loadSpatialConfig(),
    loadSubnationalData(),
    loadNationalData(),
  ]);

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const pilotParamRaw = resolvedSearchParams?.pilot;
  const pilotParam = Array.isArray(pilotParamRaw) ? pilotParamRaw[0] : pilotParamRaw;

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-12">
        <ResultsTrackingContent
          results={results}
          spatial={spatial}
          subnational={subnational}
          countryName={national.countryName}
          initialPilotId={pilotParam}
        />
      </main>
      <Footer footer={narrative.footer} />
    </>
  );
}
