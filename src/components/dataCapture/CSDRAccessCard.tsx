import Link from "next/link";

export function CSDRAccessCard() {
  return (
    <section className="flex flex-col gap-6 rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Established Workflows</p>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-slate-900">Submit data via your Data Framework</h2>
          <p className="text-sm text-slate-600">
            Already managing existing datasets or updating existing submissions? Head to the Data Fraemwork portal and
            to manage, edit and update your production datasets.
          </p>
        </div>
      </header>
      <div className="flex flex-col gap-4 rounded-xl border border-primary-soft/70 bg-primary-soft/40 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">Launch the Data Framework portal</p>
          <p className="text-xs text-slate-500">
            Use this option when you are ready to manage or submit new datasets within existing templates and formats.
          </p>
        </div>
        <Link
          href="https://csdr.dev.oceandevelopmentdata.org/"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Open Data portal
        </Link>
      </div>
      <p className="text-xs text-slate-500">
        Need help with access?{" "}
        <Link
          href="https://csdr.dev.oceandevelopmentdata.org/"
          target="_blank"
          rel="noreferrer noopener"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Contact the CSDR support team
        </Link>{" "}
        to request credentials or onboarding assistance.
      </p>
    </section>
  );
}

