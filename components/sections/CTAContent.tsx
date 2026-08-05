import { RevealOnScroll } from "@/components/primitives/RevealOnScroll";
import { AnimatedLink } from "@/components/primitives/AnimatedLink";
import { cta, brand } from "@/content/project";

export function CTAContent({ headingId }: { headingId: string }) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center justify-center px-6 py-28 text-center md:px-16">
      <RevealOnScroll delay={0}>
        <p className="eyebrow over-image mb-6">{cta.eyebrow}</p>
        <h2 id={headingId} className="over-image max-w-[16ch] text-3xl text-ink">
          {cta.heading}
        </h2>
      </RevealOnScroll>

      <RevealOnScroll delay={0.3} className="mt-8">
        <p className="over-image measure text-base text-ink-soft">{cta.body}</p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.5} className="mt-12">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-14">
          <AnimatedLink href={cta.primary.href}>
            {cta.primary.label}
          </AnimatedLink>
          <AnimatedLink href={cta.secondary.href}>
            {cta.secondary.label}
          </AnimatedLink>
        </div>
        <p className="eyebrow over-image mt-20">
          {brand.name} — {brand.tagline}
        </p>
      </RevealOnScroll>
    </div>
  );
}
