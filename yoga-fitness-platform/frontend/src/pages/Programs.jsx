import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { programsApi } from '../api/client.js';

const initialFilters = { goal: '', workoutType: '', minPrice: '', maxPrice: '', search: '' };

export default function Programs() {
  const [programs, setPrograms] = useState([]);
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
      const r = await programsApi.list(params);
      setPrograms(r.programs || []);
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

  return (
    <div data-testid="programs-page">
      <h1>Programs</h1>
      <p className="muted">Yoga, HIIT, strength, and stillness — filter by goal and price.</p>
      <form className="filters" onSubmit={apply} data-testid="programs-filters">
        <input
          type="search"
          placeholder="Search title or description"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          data-testid="filter-search"
          aria-label="Search programs"
        />
        <select
          value={filters.goal}
          onChange={(e) => setFilters((f) => ({ ...f, goal: e.target.value }))}
          data-testid="filter-program-goal"
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
          data-testid="filter-program-type"
        >
          <option value="">Any type</option>
          <option value="yoga">Yoga</option>
          <option value="hiit">HIIT</option>
          <option value="gym">Gym</option>
          <option value="meditation">Meditation</option>
        </select>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
          data-testid="filter-min-price"
        />
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
          data-testid="filter-max-price-program"
        />
        <button type="submit" className="btn btn-primary" data-testid="programs-filter-apply">
          Apply
        </button>
      </form>
      {loading && <p data-testid="programs-loading">Loading programs…</p>}
      {error && <p className="error" data-testid="programs-error">{error}</p>}
      <div className="card-grid" data-testid="program-card-list">
        {programs.map((p) => (
          <article key={p.id} className="card" data-testid={`program-card-${p.id}`}>
            <span className="badge">{p.workoutType}</span>
            <h2 style={{ margin: '0.5rem 0' }}>{p.title}</h2>
            <p className="muted">
              {p.trainerName} · ★{Number(p.trainerRating).toFixed(2)}
            </p>
            <p className="muted">
              {p.goalTag?.replace('_', ' ')} · {p.durationMinutes} min · ${Number(p.price).toFixed(0)}
            </p>
            <p>{p.description?.slice(0, 140)}{p.description?.length > 140 ? '…' : ''}</p>
            <Link
              to={`/book?programId=${p.id}&trainerId=${p.trainerId}`}
              className="btn btn-primary"
              style={{ marginTop: '0.75rem' }}
              data-testid={`program-book-${p.id}`}
            >
              Book this program
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
