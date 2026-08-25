import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import './PublicAuthLayout.css';

const PublicAuthLayout = ({ title, description, children }) => (
  <div className="public-auth-page">
    <header className="public-nav">
      <Link to="/" className="public-brand" aria-label="Pathfinder home">
        <span className="public-brand-mark">P</span>
        <span>Pathfinder</span>
      </Link>
      <Link to="/" className="public-nav-back">← Back to home</Link>
    </header>

    <main className="public-auth-main">
      <section className="public-auth-story">
        <p className="public-kicker">Career clarity, made practical</p>
        <h1>Make your next career move with confidence.</h1>
        <p>
          Understand your skills, choose a direction, and build a focused plan that moves you forward every week.
        </p>
        <div className="public-proof-list" aria-label="Pathfinder benefits">
          <span><b>01</b> Map your current skills</span>
          <span><b>02</b> Find the right next role</span>
          <span><b>03</b> Follow a clear roadmap</span>
        </div>
      </section>

      <Card className="public-auth-card">
        <p className="public-kicker">Welcome to Pathfinder</p>
        <h2>{title}</h2>
        {description && <p className="public-auth-description">{description}</p>}
        {children}
      </Card>
    </main>
  </div>
);

export default PublicAuthLayout;
