import { RevealOnScroll } from "@/components/primitives/RevealOnScroll";
import { story } from "@/content/project";

export function StoryContent({ headingId }: { headingId: string }) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center px-6 py-28 md:px-16">
      <RevealOnScroll delay={0}>
        <p className="eyebrow over-image mb-6">{story.eyebrow}</p>
        <h2 id={headingId} className="over-image max-w-[18ch] text-3xl text-ink">
          {story.heading}
        </h2>
      </RevealOnScroll>

      <RevealOnScroll delay={0.3} className="mt-10">
        <div className="measure space-y-5 text-base text-ink-soft over-image">
          {story.body.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.5} className="mt-14">
        <blockquote className="over-image max-w-[34ch] border-l border-[--rule] pl-6 text-xl text-ink">
          {story.quote}
          <footer className="eyebrow mt-5 not-italic">
            {story.attribution}
          </footer>
        </blockquote>
      </RevealOnScroll>
    </div>
  );
}
