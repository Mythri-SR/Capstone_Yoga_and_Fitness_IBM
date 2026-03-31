import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { trainersApi } from '../api/client.js';

const initialFilters = { minRating: '', maxPrice: '', goal: '', workoutType: '' };

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v != null)
      );
      const r = await trainersApi.list(params);
      setTrainers(r.trainers || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const apply = (e) => {
    e.preventDefault();
    load();
  };

  const reset = async () => {
    setFilters(initialFilters);
    setLoading(true);
    setError('');
    try {
      const r = await trainersApi.list({});
      setTrainers(r.trainers || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="trainers-page">
      <h1>Trainers</h1>
      <p className="muted">Filter by goals, modality, rating, and budget.</p>
      <form className="filters" onSubmit={apply} data-testid="trainers-filters">
        <select
          value={filters.goal}
          onChange={(e) => setFilters((f) => ({ ...f, goal: e.target.value }))}
          data-testid="filter-goal"
          aria-label="Goal"
        >
          <option value="">Any goal</option>
          <option value="weight_loss">Weight loss</option>
          <option value="flexibility">Flexibility</option>
          <option value="muscle_gain">Muscle gain</option>
          <option value="general">General</option>
        </select>
        <select
          value={filters.workoutType}
          onChange={(e) => setFilters((f) => ({ ...f, workoutType: e.target.value }))}
          data-testid="filter-workout-type"
          aria-label="Workout type"
        >
          <option value="">Any type</option>
          <option value="yoga">Yoga</option>
          <option value="hiit">HIIT</option>
          <option value="gym">Gym</option>
          <option value="meditation">Meditation</option>
        </select>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          placeholder="Min rating"
          value={filters.minRating}
          onChange={(e) => setFilters((f) => ({ ...f, minRating: e.target.value }))}
          data-testid="filter-min-rating"
          aria-label="Minimum rating"
        />
        <input
          type="number"
          step="1"
          min="0"
          placeholder="Max hourly $"
          value={filters.maxPrice}
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
          data-testid="filter-max-price"
          aria-label="Max price"
        />
        <button type="submit" className="btn btn-primary" data-testid="filter-apply">
          Apply
        </button>
        <button type="button" className="btn btn-ghost" data-testid="filter-reset" onClick={reset}>
          Reset
        </button>
      </form>
      {loading && <p data-testid="trainers-loading">Loading trainers…</p>}
      {error && <p className="error" data-testid="trainers-error">{error}</p>}
      <div className="card-grid" data-testid="trainer-card-list">
        {trainers.map((t) => (
          <article key={t.id} className="card" data-testid={`trainer-card-${t.id}`}>
            <span className="badge">Trainer</span>
            <h2 style={{ margin: '0.5rem 0' }}>{t.fullName}</h2>
            <p className="muted">
              ★ {Number(t.ratingAverage).toFixed(2)} ({t.ratingCount} reviews) · ${Number(t.hourlyRate).toFixed(0)}/hr
            </p>
            <p>{t.bio?.slice(0, 120)}{t.bio?.length > 120 ? '…' : ''}</p>
            <Link to={`/trainers/${t.id}`} className="btn btn-primary" style={{ marginTop: '0.75rem' }} data-testid={`trainer-view-${t.id}`}>
              View profile
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
