"use client";

import dynamic from "next/dynamic";
import { CameraRig } from "@/components/layout/CameraRig";
import { Scene } from "@/components/layout/Scene";
import { Nav } from "@/components/layout/Nav";
import { IntroOverlay } from "@/components/intro/IntroOverlay";
import { SceneWorld } from "@/components/primitives/SceneWorld";
import { MobileHeroSubject } from "@/components/primitives/MobileHeroSubject";
import { HeroContent } from "@/components/sections/HeroContent";
import { StoryContent } from "@/components/sections/StoryContent";
import { DetailContent } from "@/components/sections/DetailContent";
import { CTAContent } from "@/components/sections/CTAContent";
import { useMediaQuery } from "@/lib/use-media-query";
import { useMounted } from "@/lib/use-mounted";
import { hero, heroAlive, scenes, sceneCount } from "@/content/project";

// The only WebGL on the page, and never in the initial bundle.
const HeroAlive = dynamic(() => import("@/components/hero/HeroAlive"), {
  ssr: false,
});

function HeroScene({ withCanvas }: { withCanvas: boolean }) {
  return (
    <SceneWorld
      bg={scenes.hero.bg}
      fg={scenes.hero.fg}
      isHero
      priority
      fgId="intro-fg"
      midSlot={
        withCanvas ? (
          <HeroAlive
            mode={hero.mode}
            asset={hero.asset}
            particleConfig={heroAlive.particles}
            subjectConfig={heroAlive.subject}
          />
        ) : (
          <MobileHeroSubject src={hero.asset} alt="" />
        )
      }
    >
      <noscript>
        <p className="sr-only">
          The hero scene is an animated canvas. Everything it conveys is
          available as text on this page.
        </p>
      </noscript>
      <HeroContent headingId="scene-0-heading" />
    </SceneWorld>
  );
}

/**
 * Below 768px the camera is not rendered at all — no Z-track, no WebGL, no
 * foreground layers, no parallax. Scenes become an ordinary vertical stack.
 * This is also the server-rendered and no-JS output, so every word on the page
 * exists without the camera.
 */
function MobileStack() {
  return (
    <main id="main">
      <div id="hero" className="relative min-h-svh">
        <HeroScene withCanvas={false} />
      </div>
      <section id="story" className="relative min-h-svh" aria-labelledby="scene-1-heading">
        <SceneWorld bg={scenes.story.bg} mid={scenes.story.mid}>
          <StoryContent headingId="scene-1-heading" />
        </SceneWorld>
      </section>
      <section id="detail" className="relative min-h-svh" aria-labelledby="scene-2-heading">
        <SceneWorld bg={scenes.detail.bg} mid={scenes.detail.mid}>
          <DetailContent headingId="scene-2-heading" />
        </SceneWorld>
      </section>
      <section id="cta" className="relative min-h-svh" aria-labelledby="scene-3-heading">
        <SceneWorld bg={scenes.cta.bg} mid={scenes.cta.mid}>
          <CTAContent headingId="scene-3-heading" />
        </SceneWorld>
      </section>
    </main>
  );
}

function CameraStack() {
  return (
    <main id="main">
      <CameraRig sceneCount={sceneCount}>
        <Scene index={0}>
          <HeroScene withCanvas />
        </Scene>

        <Scene index={1}>
          <SceneWorld bg={scenes.story.bg} mid={scenes.story.mid}>
            <StoryContent headingId="scene-1-heading" />
          </SceneWorld>
        </Scene>

        <Scene index={2}>
          <SceneWorld
            bg={scenes.detail.bg}
            mid={scenes.detail.mid}
            fg={scenes.detail.fg}
          >
            <DetailContent headingId="scene-2-heading" />
          </SceneWorld>
        </Scene>

        <Scene index={3}>
          <SceneWorld bg={scenes.cta.bg} mid={scenes.cta.mid}>
            <CTAContent headingId="scene-3-heading" />
          </SceneWorld>
        </Scene>
      </CameraRig>
    </main>
  );
}

export default function Page() {
  const mounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const useCamera = mounted && isDesktop;

  return (
    <>
      <IntroOverlay />
      <Nav />
      {useCamera ? <CameraStack /> : <MobileStack />}
    </>
  );
}
