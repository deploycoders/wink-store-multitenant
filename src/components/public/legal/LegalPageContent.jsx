import React from "react";

export default function LegalPageContent({ title, content }) {
  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto w-full max-w-4xl px-6 lg:px-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.08em] text-zinc-900">
            {title}
          </h1>

          <div className="mt-8 h-px w-full bg-zinc-200" />

          <div className="mt-8 whitespace-pre-line text-sm md:text-base leading-7 text-zinc-600">
            {content}
          </div>
        </div>
      </div>
    </section>
  );
}
