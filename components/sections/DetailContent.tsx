import { RevealOnScroll } from "@/components/primitives/RevealOnScroll";
import { detail } from "@/content/project";

export function DetailContent({ headingId }: { headingId: string }) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center px-6 py-28 md:px-16">
      <RevealOnScroll delay={0}>
        <p className="eyebrow over-image mb-6">{detail.eyebrow}</p>
        <h2 id={headingId} className="over-image text-2xl text-ink">
          {detail.heading}
        </h2>
      </RevealOnScroll>

      <RevealOnScroll delay={0.3} className="mt-8">
        <div className="measure space-y-5 text-base text-ink-soft over-image">
          {detail.body.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </RevealOnScroll>

      {/* Specs are folded into the detail scene — the brief called for four
          scenes, so the numbers live with the instrument they describe. */}
      <RevealOnScroll delay={0.5} className="mt-14">
        <dl className="grid max-w-3xl grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {detail.specs.map((spec) => (
            <div
              key={spec.label}
              className="over-image border-t border-[--rule] pt-4"
            >
              <dt className="eyebrow">{spec.label}</dt>
              <dd className="mt-2 font-mono text-lg text-ink">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </RevealOnScroll>
    </div>
  );
}
