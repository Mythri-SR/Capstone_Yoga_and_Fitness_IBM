import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi, paymentsApi, slotsApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sessions() {
  const { user, isTrainer } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [altSlots, setAltSlots] = useState({});
  const [pickSlot, setPickSlot] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const r = await bookingsApi.list();
      setBookings(r.bookings || []);
      const trainerIds = [...new Set((r.bookings || []).map((b) => b.trainerId))];
      const slotMap = {};
      await Promise.all(
        trainerIds.map(async (tid) => {
          const s = await slotsApi.list({ trainerId: tid, booked: 'false' });
          slotMap[tid] = s.slots || [];
        })
      );
      setAltSlots(slotMap);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  if (!user) {
    return (
      <p data-testid="sessions-guest">
        <Link to="/login">Sign in</Link> to view sessions.
      </p>
    );
  }

  const pay = async (id) => {
    setMsg('');
    setError('');
    try {
      await paymentsApi.pay(id);
      setMsg('Payment successful (mock).');
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const cancel = async (id) => {
    setMsg('');
    setError('');
    try {
      await bookingsApi.cancel(id);
      setMsg('Session cancelled.');
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const reschedule = async (id, trainerId) => {
    const newSlotId = pickSlot[id];
    if (!newSlotId) {
      setError('Pick a new slot first.');
      return;
    }
    setMsg('');
    setError('');
    try {
      await bookingsApi.reschedule(id, Number(newSlotId));
      setMsg('Reschedule request sent to trainer.');
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const approve = async (id) => {
    setMsg('');
    setError('');
    try {
      await bookingsApi.approveReschedule(id);
      setMsg('Reschedule approved.');
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const reject = async (id) => {
    setMsg('');
    setError('');
    try {
      await bookingsApi.rejectReschedule(id);
      setMsg('Reschedule rejected.');
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const complete = async (id) => {
    setMsg('');
    setError('');
    try {
      await bookingsApi.complete(id);
      setMsg('Session marked complete; member progress updated.');
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p data-testid="sessions-loading">Loading sessions…</p>;

  return (
    <div data-testid="sessions-page">
      <h1>{isTrainer ? 'Training schedule' : 'My sessions'}</h1>
      {error && (
        <p className="error" data-testid="sessions-error">
          {error}
        </p>
      )}
      {msg && (
        <p data-testid="sessions-message" style={{ color: 'var(--primary)' }}>
          {msg}
        </p>
      )}
      <div className="calendar-shell" data-testid="sessions-list">
        {bookings.length === 0 && <p className="muted">No sessions yet.</p>}
        {bookings.map((b) => (
          <div key={b.id} className="slot-row" data-testid={`session-row-${b.id}`}>
            <div>
              <strong>{b.programTitle}</strong>
              <div className="muted">
                {new Date(b.slotStart).toLocaleString()} · {b.sessionType} · status: <span data-testid={`session-status-${b.id}`}>{b.status}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {!isTrainer && b.status === 'pending' && (
                <button type="button" className="btn btn-primary" data-testid={`session-pay-${b.id}`} onClick={() => pay(b.id)}>
                  Pay (mock)
                </button>
              )}
              {!isTrainer && ['pending', 'confirmed'].includes(b.status) && (
                <button type="button" className="btn btn-danger" data-testid={`session-cancel-${b.id}`} onClick={() => cancel(b.id)}>
                  Cancel
                </button>
              )}
              {!isTrainer && ['pending', 'confirmed'].includes(b.status) && (
                <span className="muted" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <select
                    value={pickSlot[b.id] || ''}
                    onChange={(e) => setPickSlot((p) => ({ ...p, [b.id]: e.target.value }))}
                    data-testid={`session-reschedule-slot-${b.id}`}
                  >
                    <option value="">Pick new slot</option>
                    {(altSlots[b.trainerId] || [])
                      .filter((s) => Number(s.id) !== Number(b.slotId))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {new Date(s.slotStart).toLocaleString()} ({s.sessionType})
                        </option>
                      ))}
                  </select>
                  <button type="button" className="btn btn-ghost" data-testid={`session-reschedule-${b.id}`} onClick={() => reschedule(b.id, b.trainerId)}>
                    Request reschedule
                  </button>
                </span>
              )}
              {isTrainer && b.status === 'reschedule_pending' && (
                <>
                  <button type="button" className="btn btn-primary" data-testid={`session-approve-${b.id}`} onClick={() => approve(b.id)}>
                    Approve reschedule
                  </button>
                  <button type="button" className="btn btn-danger" data-testid={`session-reject-${b.id}`} onClick={() => reject(b.id)}>
                    Reject
                  </button>
                </>
              )}
              {isTrainer && b.status === 'confirmed' && (
                <button type="button" className="btn btn-primary" data-testid={`session-complete-${b.id}`} onClick={() => complete(b.id)}>
                  Mark complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
