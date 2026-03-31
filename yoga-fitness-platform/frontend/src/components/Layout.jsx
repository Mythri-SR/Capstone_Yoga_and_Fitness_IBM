import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const linkStyle = ({ isActive }) => ({
    fontWeight: isActive ? 700 : 500,
    background: isActive ? 'rgba(45, 106, 79, 0.12)' : undefined,
  });

  return (
    <div className="layout">
      <header className="nav" data-testid="app-header">
        <Link to="/" className="nav-brand" data-testid="nav-brand">
          ZenFlow
        </Link>
        <nav className="nav-links" data-testid="nav-links">
          <NavLink to="/" end style={linkStyle} data-testid="nav-home">
            Home
          </NavLink>
          <NavLink to="/trainers" style={linkStyle} data-testid="nav-trainers">
            Trainers
          </NavLink>
          <NavLink to="/programs" style={linkStyle} data-testid="nav-programs">
            Programs
          </NavLink>
          <NavLink to="/book" style={linkStyle} data-testid="nav-book">
            Book
          </NavLink>
          {user && (
            <NavLink to="/sessions" style={linkStyle} data-testid="nav-sessions">
              My sessions
            </NavLink>
          )}
          {user && (
            <NavLink to="/dashboard" style={linkStyle} data-testid="nav-dashboard">
              Progress
            </NavLink>
          )}
          {!user && (
            <NavLink to="/login" style={linkStyle} data-testid="nav-login">
              Login
            </NavLink>
          )}
          {!user && (
            <NavLink to="/register" style={linkStyle} data-testid="nav-register">
              Register
            </NavLink>
          )}
          {user && (
            <button type="button" className="btn btn-ghost" data-testid="nav-logout" onClick={logout}>
              Logout ({user.fullName})
            </button>
          )}
        </nav>
      </header>
      <main data-testid="main-content">{children}</main>
    </div>
  );
}
