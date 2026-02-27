import Image from "next/image";
import Link from "next/link";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/maritime", label: "Maritime" },
  { href: "/spatial", label: "Spatial" },
  { href: "/data-capture", label: "Data Capture" },
  { href: "/results-tracking", label: "Results Tracking" },
  { href: "/strategic", label: "Strategic" },
];

export function Header() {
  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-end gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
              GOAP
            </span>
            <div className="relative h-10 w-10">
              <Image
                src="/goap_button.png"
                alt="Global Ocean Accounts Partnership logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Ocean Accounts Framework
            </span>
            <span className="text-xl font-semibold text-slate-900">
              Global Ocean Accounts Partnership
            </span>
          </div>
        </div>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 transition-colors hover:bg-primary-soft/70 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
