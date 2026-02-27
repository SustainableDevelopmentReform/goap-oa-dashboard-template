import type { GeeAppConfig } from "@/types";

interface GEEEmbedProps {
  config: GeeAppConfig;
}

export function GEEEmbed({ config }: GEEEmbedProps) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
      <header className="flex flex-col gap-2 pb-4">
        <h2 className="text-2xl font-semibold text-slate-900">{config.title}</h2>
        {config.description ? <p className="text-sm text-slate-600">{config.description}</p> : null}
      </header>
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
        <iframe
          src={config.url}
          title={config.title}
          className="h-full w-full"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </section>
  );
}
