import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section className="hero" data-testid="home-hero">
        <h1>Breathe. Move. Grow.</h1>
        <p className="muted" style={{ maxWidth: '36rem', lineHeight: 1.6 }}>
          ZenFlow connects you with certified trainers and mindful programs — from vinyasa to HIIT — with simple
          booking, calm dashboards, and progress you can feel.
        </p>
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/programs" className="btn btn-primary" data-testid="home-cta-programs">
            Browse programs
          </Link>
          <Link to="/book" className="btn btn-ghost" data-testid="home-cta-book">
            Book a session
          </Link>
        </div>
      </section>
      <section data-testid="home-highlights">
        <h2>Why ZenFlow</h2>
        <div className="card-grid" style={{ marginTop: '1rem' }}>
          <div className="card" data-testid="home-card-trainers">
            <span className="badge">Trainers</span>
            <h3>Verified profiles</h3>
            <p className="muted">Certifications, experience, and honest ratings in one place.</p>
          </div>
          <div className="card" data-testid="home-card-booking">
            <span className="badge">Booking</span>
            <h3>Slot-based scheduling</h3>
            <p className="muted">Live, recorded, or personal training — without double-booking.</p>
          </div>
          <div className="card" data-testid="home-card-progress">
            <span className="badge">Progress</span>
            <h3>Streaks &amp; stats</h3>
            <p className="muted">Workouts, calories, and attendance at a glance.</p>
          </div>
        </div>
      </section>
    </>
  );
}
