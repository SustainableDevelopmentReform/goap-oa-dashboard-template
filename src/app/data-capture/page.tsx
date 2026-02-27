import type { Metadata } from "next";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CSDRAccessCard } from "@/components/dataCapture/CSDRAccessCard";
import { DataSubmissionForm } from "@/components/dataCapture/DataSubmissionForm";
import { loadNarrativeData } from "@/lib/dataLoader";

export const metadata: Metadata = {
  title: "Data Capture",
  description:
    "Capture new datasets for the GOAP Ocean Accounts dashboard using the CSDR portal or the demonstration QC webform.",
};

export default async function DataCapturePage() {
  const narrative = await loadNarrativeData();

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-12">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Data Onboarding</p>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold text-slate-900">Capture and submit new data</h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Choose the pathway that suits your workflow: use your Data Framework platform portal for data management, or use the
              webform to understand the metadata and quality information requested for new datasets, and submit your data.
            </p>
          </div>
        </div>

        <div className="grid gap-10">
          <CSDRAccessCard />
          <DataSubmissionForm />
        </div>
      </main>
      <Footer footer={narrative.footer} />
    </>
  );
}
