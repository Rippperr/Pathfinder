import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import './LandingPage.css';

const LandingPage = () => {
  const { session, loading } = useUser();

  if (!loading && session) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing-page">
      <header className="public-nav landing-nav">
        <Link to="/" className="public-brand">
          <span className="public-brand-mark">P</span>
          <span>Pathfinder</span>
        </Link>
        <nav className="landing-actions" aria-label="Account actions">
          <Link to="/login" className="landing-login">Log in</Link>
          <Link to="/signup" className="landing-signup">Start for free <span>→</span></Link>
        </nav>
      </header>

      <main className="landing-hero">
        <section className="landing-copy">
          <p className="public-kicker">A clearer way forward</p>
          <h1>Build a career that <em>moves</em> with you.</h1>
          <p className="landing-lede">
            Pathfinder turns your experience and skills into a focused plan for the role you want next.
          </p>
          <div className="landing-cta-row">
            <Link to="/signup" className="landing-primary-cta">Create your roadmap <span>→</span></Link>
            <Link to="/login" className="landing-secondary-cta">I already have an account</Link>
          </div>
          <div className="landing-trust-row">
            <span>Skills you have</span><i></i><span>Role you want</span><i></i><span>Clear next steps</span>
          </div>
        </section>

        <section className="landing-visual" aria-label="A preview of a Pathfinder career roadmap">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <article className="path-card path-card-main">
            <div className="path-card-top"><span>YOUR NEXT MOVE</span><b>72% ready</b></div>
            <h2>Frontend Developer</h2>
            <div className="path-progress"><span></span></div>
            <p>3 skills to strengthen</p>
          </article>
          <article className="path-card path-card-float-one"><span className="path-check">✓</span><div><b>React</b><small>Skill demonstrated</small></div></article>
          <article className="path-card path-card-float-two"><span className="path-step">02</span><div><b>Build a portfolio project</b><small>Your next action</small></div></article>
        </section>
      </main>

      <section className="landing-feature-strip">
        <div><b>Know where you stand.</b><span>See the skills you already bring.</span></div>
        <div><b>Choose with clarity.</b><span>Understand what each role demands.</span></div>
        <div><b>Move with purpose.</b><span>Follow a practical career roadmap.</span></div>
      </section>
    </div>
  );
};

export default LandingPage;
