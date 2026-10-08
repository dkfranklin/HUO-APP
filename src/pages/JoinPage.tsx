import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import OnboardingForm from '@/components/shadcn-space/blocks/forms-06/onboarding-form';

export function JoinPage() {
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
        <Link to="/hire" className="landing-cta landing-cta-ghost">
          Hiring creatives? →
        </Link>
      </header>

      <section className="landing-form-section" aria-label="Huo talent call form">
        <div className="landing-form-intro">
          <p className="landing-micro">TALENT CALL</p>
          <h1 className="landing-form-kicker">Tell us who you are.</h1>
          <p className="landing-form-note">
            We're building Columbus' creative network. Tell us about yourself, what you
            do, and what opportunities you're looking for. If there's a fit, we'll reach
            out.
          </p>
        </div>
        <OnboardingForm />
      </section>
    </div>
  );
}

export default JoinPage;
