import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 440 }} data-testid="register-page">
      <h1>Create your account</h1>
      <p className="muted">Members book sessions; trainers receive approvals and completions.</p>
      <form className="form" onSubmit={submit} style={{ marginTop: '1rem' }}>
        <div>
          <label htmlFor="reg-name">Full name</label>
          <input
            id="reg-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={2}
            data-testid="form-register-name"
          />
        </div>
        <div>
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="form-register-email"
          />
        </div>
        <div>
          <label htmlFor="reg-pass">Password (min 8)</label>
          <input
            id="reg-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            data-testid="form-register-password"
          />
        </div>
        <div>
          <label htmlFor="reg-role">I am a</label>
          <select id="reg-role" value={role} onChange={(e) => setRole(e.target.value)} data-testid="form-register-role">
            <option value="user">Member</option>
            <option value="trainer">Trainer</option>
          </select>
        </div>
        {error && (
          <p className="error" data-testid="form-register-error">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading} data-testid="form-register-submit">
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: '1rem' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
