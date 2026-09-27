import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import HireForm from '@/components/shadcn-space/blocks/forms-06/hire-form';

export function HirePage() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="landing-page landing-hire">
      <div className="landing-grain" aria-hidden="true" />

      <header className="landing-corners landing-hire-header">
        <Link to="/" className="landing-brand landing-hire-home">
          <p className="landing-micro">HUO</p>
          <p className="landing-micro">COLUMBUS, OHIO</p>
          <p className="landing-micro">CREATIVE NETWORK</p>
        </Link>
        <Link to="/#talent-call" className="landing-cta landing-cta-ghost">
          I'm a creative →
        </Link>
      </header>

      <section className="landing-form-section" aria-label="Huo hire interest form">
        <div className="landing-form-intro">
          <p className="landing-micro">HIRING CREATIVES</p>
          <h1 className="landing-form-kicker">Find local talent for paid gigs.</h1>
          <p className="landing-form-note">
            Tell us about your business. We'll match you by hand with Columbus models,
            photographers, stylists and more.
          </p>
        </div>
        <HireForm />
      </section>
    </div>
  );
}

export default HirePage;
