import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { progressApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calories, setCalories] = useState(100);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let c = false;
    (async () => {
      try {
        const r = await progressApi.get();
        if (!c) setProgress(r.progress);
      } catch (e) {
        if (!c) setError(e.message);
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [user?.id]);

  const logWorkout = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const r = await progressApi.log({
        caloriesBurned: Number(calories) || 0,
        workoutDelta: 1,
        markAttendance: true,
      });
      setProgress(r.progress);
      setMsg('Progress updated.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <p data-testid="dashboard-guest">
        <Link to="/login">Sign in</Link> to view progress.
      </p>
    );
  }

  if (loading) return <p data-testid="dashboard-loading">Loading progress…</p>;

  return (
    <div data-testid="dashboard-page">
      <h1>Progress dashboard</h1>
      <p className="muted">Workouts, calories, attendance, and streaks — synced when trainers complete sessions.</p>
      {error && (
        <p className="error" data-testid="dashboard-error">
          {error}
        </p>
      )}
      {msg && (
        <p data-testid="dashboard-message" style={{ color: 'var(--primary)' }}>
          {msg}
        </p>
      )}
      <div className="stats" data-testid="dashboard-stats">
        <div className="stat" data-testid="stat-workouts">
          <strong>{progress?.totalWorkouts ?? 0}</strong>
          <span className="muted">Workouts</span>
        </div>
        <div className="stat" data-testid="stat-calories">
          <strong>{progress?.totalCalories ?? 0}</strong>
          <span className="muted">Calories</span>
        </div>
        <div className="stat" data-testid="stat-attendance">
          <strong>{progress?.attendanceSessions ?? 0}</strong>
          <span className="muted">Attendance</span>
        </div>
        <div className="stat" data-testid="stat-streak">
          <strong>{progress?.currentStreakDays ?? 0}</strong>
          <span className="muted">Streak days</span>
        </div>
      </div>
      <div className="card" style={{ marginTop: '1.5rem', maxWidth: 420 }} data-testid="dashboard-log-form">
        <h2>Log a self-reported workout</h2>
        <form className="form" onSubmit={logWorkout}>
          <div>
            <label htmlFor="log-cal">Calories (0–10000)</label>
            <input
              id="log-cal"
              type="number"
              min={0}
              max={10000}
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              data-testid="dashboard-calories-input"
            />
          </div>
          <button type="submit" className="btn btn-primary" data-testid="dashboard-log-submit">
            Log workout
          </button>
        </form>
      </div>
    </div>
  );
}
