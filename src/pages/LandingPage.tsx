import { useLayoutEffect, useRef } from 'react';
import { motion, useTransform } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePosterMotion } from '../hooks/usePosterMotion';
import { DISCIPLINES, HERO_LINES, INSTAGRAM_URL } from '../data/landing';

const linkRel = 'noopener noreferrer';

export function LandingPage() {
  const { hash, search } = useLocation();
  const navigate = useNavigate();
  const posterRef = useRef<HTMLDivElement>(null);
  const motionLayers = usePosterMotion(posterRef);

  const heroY = useTransform(
    [motionLayers.hero.y, motionLayers.scrollFade],
    ([pointerY, scrollY]) => Number(pointerY) + Number(scrollY) * 0.85
  );
  const heroOpacity = useTransform(motionLayers.scrollFade, [0, 18], [1, 0.72]);

  useLayoutEffect(() => {
    // Older shared links point at /#talent-call; the form now lives on /join.
    if (hash === '#talent-call') {
      navigate(`/join${search}`, { replace: true });
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [hash, search, navigate]);

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

          <motion.div
            className="landing-disciplines landing-fade landing-fade-delay-2"
            style={{
              x: motionLayers.disciplines.x,
              y: motionLayers.disciplines.y,
              rotate: motionLayers.disciplines.rotate,
            }}
          >
            <p className="landing-disciplines-label">Now calling</p>
            <ul>
              {DISCIPLINES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.div>
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

        <footer className="landing-footer">
          <div className="landing-call">
            <p className="landing-micro">HUO CREATIVE TALENT CALL</p>
            <p className="landing-micro landing-call-sub">NOW OPEN</p>
            <p className="landing-tagline">
              Columbus&apos; creative network, connecting creatives with businesses and opportunities.
            </p>
          </div>

          <nav className="landing-ctas" aria-label="Talent call actions">
            <Link className="landing-cta landing-cta-primary" to={`/join${search}`}>
              Join the talent call
            </Link>
            <Link className="landing-cta landing-cta-secondary" to="/hire">
              Hiring creatives? →
            </Link>
          </nav>

          <a
            className="landing-cta landing-cta-ghost"
            href={INSTAGRAM_URL}
            target="_blank"
            rel={linkRel}
          >
            @huoapp
          </a>

        </footer>
      </div>

      <section className="landing-form-section landing-about" aria-label="What is Huo?">
        <div className="landing-form-intro">
          <p className="landing-micro">WHAT IS HUO?</p>
          <h2 className="landing-form-kicker">We are building the Columbus Creative Network.</h2>
          <p className="landing-form-note">
            Huo is a platform and network being built to connect Columbus creatives with
            businesses, opportunities, and other creatives.
          </p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
