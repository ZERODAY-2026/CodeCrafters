import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentContext } from '../../context/DocumentContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { backendHealth } = useDocumentContext();

  return (
    <header
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 64px',
        borderBottom: '1px solid var(--line2)',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text)',
          textDecoration: 'none',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          <path
            d="M6 3h10l5 5v15H6z"
            stroke="currentColor"
            style={{ color: 'var(--accent)' }}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M10 13h8M10 17h8"
            stroke="currentColor"
            style={{ color: 'var(--accent)' }}
            strokeWidth="1.5"
          />
        </svg>
        <span style={{ fontSize: '19px', fontWeight: 500, letterSpacing: '-0.01em' }}>Plainly</span>
      </Link>

      {isHome ? (
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', fontSize: '15px' }}>
          <a href="#how" style={{ color: 'var(--muted)', textDecoration: 'none' }}>How it works</a>
          <a href="#features" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Features</a>
          <a href="#privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</a>
        </nav>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontFamily: "'Geist Mono', monospace" }}>
          <Link
            to="/overview"
            style={{
              color: location.pathname === '/overview' ? 'var(--accent)' : 'var(--muted)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              background: location.pathname === '/overview' ? 'var(--hover)' : 'transparent',
            }}
          >
            Overview
          </Link>
          <span style={{ color: 'var(--line4)' }}>/</span>
          <Link
            to="/chat"
            style={{
              color: location.pathname === '/chat' ? 'var(--accent)' : 'var(--muted)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              background: location.pathname === '/chat' ? 'var(--hover)' : 'transparent',
            }}
          >
            Chat & Query
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {/* Backend health status badge */}
        <div
          title={backendHealth.ok ? `Engine: ${backendHealth.ocrEngine} | Model: ${backendHealth.model}` : 'Backend offline (Demo fallback active)'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontFamily: "'Geist Mono', monospace",
            padding: '6px 12px',
            borderRadius: '999px',
            background: 'var(--panel)',
            border: '1px solid var(--line3)',
            color: backendHealth.ok ? 'var(--text)' : 'var(--muted)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: backendHealth.ok ? 'var(--accent)' : '#EAB308',
              display: 'inline-block',
            }}
          />
          <span>{backendHealth.ok ? (backendHealth.model || 'gemma4:e4b') : 'Standalone'}</span>
        </div>

        <Link
          to="/chat"
          style={{ fontSize: '15px', padding: '12px 16px', color: 'var(--muted)', textDecoration: 'none' }}
        >
          Chat View
        </Link>
        <Link
          to="/overview"
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--on-accent)',
            background: 'var(--text)',
            padding: '12px 20px',
            borderRadius: '999px',
            textDecoration: 'none',
          }}
        >
          Overview
        </Link>
      </div>
    </header>
  );
};
