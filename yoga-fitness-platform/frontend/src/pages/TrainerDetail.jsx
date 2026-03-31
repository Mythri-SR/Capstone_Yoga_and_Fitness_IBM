import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { trainersApi, reviewsApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function TrainerDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [programId, setProgramId] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewErr, setReviewErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, rv] = await Promise.all([trainersApi.get(id), reviewsApi.list(id)]);
        if (!cancelled) {
          setData(t);
          setReviews(rv.reviews || []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewErr('');
    setReviewMsg('');
    if (!user) {
      setReviewErr('Please sign in to leave a review.');
      return;
    }
    try {
      await reviewsApi.create({
        trainerId: Number(id),
        programId: programId ? Number(programId) : undefined,
        rating: Number(rating),
        comment: comment.trim() || undefined,
      });
      setReviewMsg('Thanks! Your review was posted.');
      setComment('');
      const rv = await reviewsApi.list(id);
      setReviews(rv.reviews || []);
    } catch (err) {
      setReviewErr(err.message);
    }
  };

  if (error) {
    return (
      <p className="error" data-testid="trainer-detail-error">
        {error}
      </p>
    );
  }
  if (!data) return <p data-testid="trainer-detail-loading">Loading…</p>;

  const { trainer, programs } = data;

  return (
    <div data-testid="trainer-detail-page">
      <div className="card" data-testid="trainer-detail-header">
        <span className="badge">Trainer</span>
        <h1>{trainer.fullName}</h1>
        <p className="muted">
          ★ {Number(trainer.ratingAverage).toFixed(2)} · {trainer.experienceYears} yrs experience · $
          {Number(trainer.hourlyRate).toFixed(0)}/hr
        </p>
        <p>{trainer.bio}</p>
        {trainer.certifications?.length > 0 && (
          <p data-testid="trainer-certs">
            <strong>Certifications:</strong> {trainer.certifications.join(', ')}
          </p>
        )}
        <Link to={`/book?trainerId=${trainer.id}`} className="btn btn-primary" style={{ marginTop: '0.75rem' }} data-testid="trainer-book-cta">
          Book with {trainer.fullName.split(' ')[0]}
        </Link>
      </div>
      <h2 style={{ marginTop: '2rem' }}>Programs</h2>
      <div className="card-grid">
        {(programs || []).map((p) => (
          <div key={p.id} className="card" data-testid={`trainer-program-${p.id}`}>
            <span className="badge">{p.workoutType}</span>
            <h3>{p.title}</h3>
            <p className="muted">{p.goalTag?.replace('_', ' ')} · {p.durationMinutes} min · ${Number(p.price).toFixed(0)}</p>
          </div>
        ))}
      </div>
      {user && user.role === 'user' && (
        <div className="card" style={{ marginTop: '2rem' }} data-testid="trainer-review-form-wrap">
          <h2>Write a review</h2>
          <form className="form" onSubmit={submitReview}>
            <div>
              <label htmlFor="rev-program">Program (optional)</label>
              <select
                id="rev-program"
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                data-testid="review-program-select"
              >
                <option value="">General</option>
                {(programs || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rev-rating">Rating</label>
              <select id="rev-rating" value={rating} onChange={(e) => setRating(e.target.value)} data-testid="review-rating">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rev-comment">Comment</label>
              <textarea
                id="rev-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                data-testid="review-comment"
              />
            </div>
            {reviewErr && (
              <p className="error" data-testid="review-error">
                {reviewErr}
              </p>
            )}
            {reviewMsg && (
              <p data-testid="review-success" style={{ color: 'var(--primary)' }}>
                {reviewMsg}
              </p>
            )}
            <button type="submit" className="btn btn-primary" data-testid="review-submit">
              Submit review
            </button>
          </form>
        </div>
      )}
      <h2 style={{ marginTop: '2rem' }}>Reviews</h2>
      <ul data-testid="trainer-reviews-list" style={{ listStyle: 'none', padding: 0 }}>
        {reviews.length === 0 && <li className="muted">No reviews yet.</li>}
        {reviews.map((r) => (
          <li key={r.id} className="card" style={{ marginBottom: '0.75rem' }} data-testid={`review-${r.id}`}>
            <strong>{r.userName}</strong> — ★{r.rating}
            <p className="muted">{r.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
