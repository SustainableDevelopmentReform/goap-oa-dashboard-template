"use client";

import Image from "next/image";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveAssetUrl } from "@/lib/config";
import type { NarrativeImage, NarrativeSection } from "@/types";

interface NarrativeSectionsProps {
  sections: NarrativeSection[];
}

export function NarrativeSections({ sections }: NarrativeSectionsProps) {
  const [expandedImage, setExpandedImage] = useState<NarrativeImage | null>(null);
  const orderedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <>
      <section className="space-y-10">
        {orderedSections.map((section, index) => {
          const hasImage = section.images.length > 0;
          const image = hasImage ? section.images[0] : undefined;
          const isImageLeft = index % 2 === 0;

          if (image && image.position === "center") {
            return (
              <article
                key={section.id}
                className="flex flex-col gap-6 rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm"
              >
                <figure className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedImage(image)}
                    className="group relative h-[360px] overflow-hidden rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/30"
                  >
                    <Image
                      src={resolveAssetUrl(image.filename)}
                      alt={image.altText}
                      fill
                      sizes="(min-width: 1280px) 70vw, (min-width: 768px) 85vw, 100vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.015]"
                    />
                    <span className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      Click to enlarge
                    </span>
                  </button>
                  {image.caption ? (
                    <figcaption className="text-xs text-slate-500">{image.caption}</figcaption>
                  ) : null}
                </figure>
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl font-semibold text-slate-900">{section.title}</h3>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="space-y-4 text-base leading-relaxed text-slate-600"
                  >
                    {section.content}
                  </ReactMarkdown>
                </div>
              </article>
            );
          }

          return (
            <article
              key={section.id}
              className="grid gap-8 rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm md:grid-cols-5 md:items-center"
            >
              {image ? (
                <div
                  className={`relative h-60 overflow-hidden rounded-2xl md:col-span-2 ${
                    isImageLeft ? "order-first" : "md:order-last"
                  }`}
                >
                  <Image
                    src={resolveAssetUrl(image.filename)}
                    alt={image.altText}
                    fill
                    sizes="(min-width: 1024px) 35vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  {image.caption ? (
                    <p className="absolute bottom-0 left-0 w-full bg-black/50 px-4 py-2 text-xs text-white">
                      {image.caption}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div
                className={`flex flex-col gap-4 md:col-span-3 ${image ? "" : "md:col-span-5"}`}
              >
                <h3 className="text-2xl font-semibold text-slate-900">{section.title}</h3>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="space-y-4 text-base leading-relaxed text-slate-600"
                >
                  {section.content}
                </ReactMarkdown>
              </div>
            </article>
          );
        })}
      </section>

      {expandedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-6"
          role="dialog"
          aria-modal="true"
          aria-label={expandedImage.altText}
        >
          <div className="relative flex max-h-full max-w-5xl flex-col gap-4">
            <button
              type="button"
              onClick={() => setExpandedImage(null)}
              className="self-end rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow"
            >
              Close
            </button>
            <div className="relative h-[70vh] w-[80vw] max-w-5xl overflow-hidden rounded-3xl bg-white">
              <Image
                src={resolveAssetUrl(expandedImage.filename)}
                alt={expandedImage.altText}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            {expandedImage.caption ? (
              <p className="text-center text-sm text-white/80">{expandedImage.caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
