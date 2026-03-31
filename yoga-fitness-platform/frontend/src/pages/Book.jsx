import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { programsApi, slotsApi, bookingsApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Book() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const presetProgramId = searchParams.get('programId');
  const presetTrainerId = searchParams.get('trainerId');

  const [programs, setPrograms] = useState([]);
  const [programId, setProgramId] = useState(presetProgramId || '');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [bookingBusy, setBookingBusy] = useState(false);

  const selectedProgram = useMemo(
    () => programs.find((p) => String(p.id) === String(programId)),
    [programs, programId]
  );

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const r = await programsApi.list({});
        if (!c) {
          setPrograms(r.programs || []);
          if (presetProgramId) setProgramId(String(presetProgramId));
        }
      } catch (e) {
        if (!c) setError(e.message);
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [presetProgramId]);

  const trainerId = selectedProgram?.trainerId || presetTrainerId;

  useEffect(() => {
   if (!trainerId) {
      setSlots([]);
      return;
    }
    let c = false;
    (async () => {
      try {
        const r = await slotsApi.list({ trainerId, booked: 'false' });
        if (!c) setSlots(r.slots || []);
      } catch (e) {
        if (!c) setError(e.message);
      }
    })();
    return () => {
      c = true;
    };
  }, [trainerId]);

  const filteredSlots = useMemo(() => {
    if (!selectedProgram) return [];
    return slots.filter(
      (s) => !s.programId || Number(s.programId) === Number(selectedProgram.id)
    );
  }, [slots, selectedProgram]);

  const book = async (slot) => {
    if (!user) {
      setError('Please log in to book.');
      return;
    }
    if (!selectedProgram) {
      setError('Select a program first.');
      return;
    }
    setBookingBusy(true);
    setError('');
    setMsg('');
    try {
      await bookingsApi.create({
        slotId: slot.id,
        programId: selectedProgram.id,
        sessionType: slot.sessionType,
      });
      setMsg('Booked! Complete payment under My sessions.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBookingBusy(false);
    }
  };

  if (loading || authLoading) return <p data-testid="book-loading">Loading programs…</p>;

  return (
    <div data-testid="book-page">
      <h1>Book a session</h1>
      <p className="muted">Choose a program, then pick an open slot from the calendar-style list.</p>
      {!user && (
        <p className="muted" data-testid="book-login-hint">
          <Link to="/login">Sign in</Link> to book.
        </p>
      )}
      <div className="card" style={{ maxWidth: 480, marginBottom: '1.5rem' }}>
        <label htmlFor="book-program" className="muted" style={{ fontWeight: 600 }}>
          Program
        </label>
        <select
          id="book-program"
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
          data-testid="book-program-select"
          style={{ width: '100%', marginTop: '0.35rem' }}
        >
          <option value="">Select a program</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {p.trainerName}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="error" data-testid="book-error">
          {error}
        </p>
      )}
      {msg && (
        <p data-testid="book-success" style={{ color: 'var(--primary)' }}>
          {msg}{' '}
          <Link to="/sessions">Go to sessions</Link>
        </p>
      )}
      <section className="calendar-shell" data-testid="book-slot-list">
        <h2>Open slots</h2>
        {filteredSlots.length === 0 && (
          <p className="muted" data-testid="book-no-slots">
            No open slots for this program.
          </p>
        )}
        {filteredSlots.map((s) => (
          <div key={s.id} className="slot-row" data-testid={`slot-row-${s.id}`}>
            <div>
              <strong>{new Date(s.slotStart).toLocaleString()}</strong>
              <div className="muted">
                {s.sessionType} · {s.programTitle || 'Open'} · ends {new Date(s.slotEnd).toLocaleTimeString()}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!user || !selectedProgram || bookingBusy}
              onClick={() => book(s)}
              data-testid={`book-slot-${s.id}`}
            >
              Book
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
