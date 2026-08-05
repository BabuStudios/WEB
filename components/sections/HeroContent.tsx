import { RevealOnScroll } from "@/components/primitives/RevealOnScroll";
import { AnimatedLink } from "@/components/primitives/AnimatedLink";
import { hero } from "@/content/project";

export function HeroContent({ headingId }: { headingId: string }) {
  return (
    <div className="flex min-h-svh w-full flex-col justify-end px-6 pb-24 pt-28 md:px-16 md:pb-28">
      <RevealOnScroll delay={0}>
        <p className="eyebrow over-image mb-6">{hero.eyebrow}</p>
        <h1
          id={headingId}
          className="over-image max-w-[16ch] text-hero text-ink"
        >
          {hero.headline}
        </h1>
      </RevealOnScroll>

      <RevealOnScroll delay={0.3} className="mt-8">
        <p className="over-image measure text-lg text-ink-soft">
          {hero.subhead}
        </p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.5} className="mt-10">
        <AnimatedLink href={hero.cta.href}>{hero.cta.label}</AnimatedLink>
      </RevealOnScroll>
    </div>
  );
}
