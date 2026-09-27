import { useLayoutEffect, useRef } from 'react';
import { motion, useTransform } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import OnboardingForm from '@/components/shadcn-space/blocks/forms-06/onboarding-form';
import { usePosterMotion } from '../hooks/usePosterMotion';
import { COLLAB_HANDLES, DISCIPLINES, HERO_LINES, INSTAGRAM_URL } from '../data/landing';

const linkRel = 'noopener noreferrer';

export function LandingPage() {
  const { hash } = useLocation();
  const posterRef = useRef<HTMLDivElement>(null);
  const motionLayers = usePosterMotion(posterRef);

  const heroY = useTransform(
    [motionLayers.hero.y, motionLayers.scrollFade],
    ([pointerY, scrollY]) => Number(pointerY) + Number(scrollY) * 0.85
  );
  const heroOpacity = useTransform(motionLayers.scrollFade, [0, 18], [1, 0.72]);

  useLayoutEffect(() => {
    if (hash === '#talent-call') {
      const target = document.getElementById('talent-call');
      target?.scrollIntoView({ behavior: 'instant', block: 'start' });
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [hash]);

  return (
    <div className="landing-page">
      <div className="landing-root" ref={posterRef}>
        <motion.div
          className="landing-grain"
          aria-hidden="true"
          style={{
            x: motionLayers.grain.x,
            y: motionLayers.grain.y,
          }}
        />

        <header className="landing-corners">
          <motion.div
            className="landing-brand landing-fade landing-fade-delay-1"
            style={{
              x: motionLayers.brand.x,
              y: motionLayers.brand.y,
              rotate: motionLayers.brand.rotate,
            }}
          >
            <p className="landing-micro">HUO</p>
            <p className="landing-micro">COLUMBUS, OHIO</p>
            <p className="landing-micro">CREATIVE NETWORK</p>
          </motion.div>

          <motion.ul
            className="landing-disciplines landing-fade landing-fade-delay-2"
            style={{
              x: motionLayers.disciplines.x,
              y: motionLayers.disciplines.y,
              rotate: motionLayers.disciplines.rotate,
            }}
          >
            {DISCIPLINES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </motion.ul>
        </header>

        <main className="landing-main">
          <motion.h1
            className="landing-hero landing-fade landing-fade-delay-3"
            style={{
              x: motionLayers.hero.x,
              y: motionLayers.prefersReduced ? motionLayers.hero.y : heroY,
              rotate: motionLayers.hero.rotate,
              opacity: motionLayers.prefersReduced ? 1 : heroOpacity,
            }}
          >
            {HERO_LINES.map((line) => (
              <span key={line} className="landing-hero-line">
                {line}
              </span>
            ))}
          </motion.h1>
        </main>

        <footer className="landing-footer landing-fade landing-fade-delay-4">
          <div className="landing-call">
            <p className="landing-micro">HUO CREATIVE TALENT CALL</p>
            <p className="landing-micro landing-call-sub">JOIN BELOW</p>
          </div>

          <nav className="landing-ctas" aria-label="Talent call actions">
            <a className="landing-cta landing-cta-primary" href="#talent-call">
              Join the talent call
            </a>
            <Link className="landing-cta landing-cta-secondary" to="/hire">
              Hiring creatives? →
            </Link>
            <a
              className="landing-cta landing-cta-ghost"
              href={INSTAGRAM_URL}
              target="_blank"
              rel={linkRel}
            >
              @huoapp
            </a>
          </nav>

          <ul className="landing-collab">
            {COLLAB_HANDLES.map(({ handle, url }) => (
              <li key={handle}>
                <a href={url} target="_blank" rel={linkRel}>
                  @{handle}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </div>

      <section
        id="talent-call"
        className="landing-form-section"
        aria-label="Huo talent call form"
      >
        <div className="landing-form-intro">
          <p className="landing-micro">TALENT CALL</p>
          <p className="landing-form-kicker">Tell us who you are.</p>
          <p className="landing-form-note">
            We match Columbus creatives with paid local gigs by hand. If there's a fit,
            we'll reach out.
          </p>
        </div>
        <OnboardingForm />
      </section>
    </div>
  );
}

export default LandingPage;
