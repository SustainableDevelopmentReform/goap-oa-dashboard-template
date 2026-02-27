import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GOAP Ocean Accounts Dashboard",
    template: "%s | GOAP Ocean Accounts Dashboard",
  },
  description:
    "Generic, data-driven ocean accounts dashboard framework developed for the Global Ocean Accounts Partnership.",
  authors: [{ name: "Global Ocean Accounts Partnership" }],
  keywords: [
    "Ocean Accounts",
    "Environmental Accounting",
    "Marine Data",
    "GOAP",
    "Spatial Data Framework",
  ],
  openGraph: {
    title: "GOAP Ocean Accounts Dashboard",
    description:
      "A generic, configurable Next.js framework for delivering national ocean accounts dashboards.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#d9f0ff_0%,#f8fafc_45%,#ecf2f8_100%)]">
          {children}
        </div>
      </body>
    </html>
  );
}
