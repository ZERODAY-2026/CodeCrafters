import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { SpaceCanvas } from '../components/space/SpaceCanvas';
import { PlainlyDropzone } from '../components/document/PlainlyDropzone';
import { ClaudeChatBox } from '../components/claude/ClaudeChatBox';
import { ThemeToggle } from '../components/theme/ThemeToggle';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div
      className="space"
      style={{
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        color: 'var(--text)',
        fontFamily: "'Geist', system-ui, sans-serif",
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SpaceCanvas showSatellite={true} />
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '96px 64px 56px',
          gap: '28px',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid var(--line3)',
            borderRadius: '999px',
            padding: '8px 16px',
            fontFamily: "'Geist Mono', monospace",
            fontSize: '13px',
            color: 'var(--muted)',
            background: 'var(--panel)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'inline-block',
            }}
          />
          Contracts, leases, NDAs, policies and more
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontWeight: 400,
            fontSize: 'clamp(54px, 7vw, 92px)',
            lineHeight: 0.98,
            letterSpacing: '-0.02em',
            maxWidth: '960px',
          }}
        >
          Legal documents, <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>in plain English.</em>
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: '620px',
            fontSize: '20px',
            lineHeight: 1.55,
            color: 'var(--muted)',
            fontWeight: 300,
          }}
        >
          Upload a PDF or plain text document. Plainly explains each clause in everyday language with gemma4:4b.
        </p>

        {/* Claude Style Input Interface with gemma4:4b & PDF/TXT upload */}
        <ClaudeChatBox />
      </section>

      {/* Three steps Section */}
      <section
        id="how"
        style={{
          padding: '72px 64px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '48px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontWeight: 400,
            fontSize: '52px',
            lineHeight: 1.05,
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}
        >
          Three steps. No jargon.
        </h2>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            width: '100%',
            maxWidth: '1120px',
          }}
        >
          <div
            className="feature-card"
            style={{
              flex: '1 1 280px',
              minWidth: 0,
              border: '1px solid var(--line)',
              borderRadius: '16px',
              padding: '32px',
              background: 'var(--panel)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '13px', color: 'var(--accent)' }}>01</span>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 500 }}>Upload your PDF</h3>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: 'var(--muted)', fontWeight: 300 }}>
              Scanned or digital. We read it, find the parties, dates and obligations.
            </p>
          </div>

          <div
            className="feature-card"
            style={{
              flex: '1 1 280px',
              minWidth: 0,
              border: '1px solid var(--line)',
              borderRadius: '16px',
              padding: '32px',
              background: 'var(--panel)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '13px', color: 'var(--accent)' }}>02</span>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 500 }}>Get a clear summary</h3>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: 'var(--muted)', fontWeight: 300 }}>
              What it is, who is involved, what you owe, and what to watch out for.
            </p>
          </div>

          <div
            className="feature-card"
            style={{
              flex: '1 1 280px',
              minWidth: 0,
              border: '1px solid var(--line)',
              borderRadius: '16px',
              padding: '32px',
              background: 'var(--panel)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '13px', color: 'var(--accent)' }}>03</span>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 500 }}>Ask follow-up questions</h3>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: 'var(--muted)', fontWeight: 300 }}>
              &ldquo;Can I end this early?&rdquo; Every answer links back to the exact clause.
            </p>
          </div>
        </div>
      </section>

      {/* Features: Risky Clauses */}
      <section
        id="features"
        style={{
          padding: '72px 64px 40px',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1120px',
            border: '1px solid var(--line)',
            borderRadius: '24px',
            background: 'var(--panel)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '48px',
            boxSizing: 'border-box',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontWeight: 400,
                fontSize: '46px',
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
              }}
            >
              Risky clauses, flagged before you sign.
            </h2>
            <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.6, color: 'var(--muted)', fontWeight: 300 }}>
              Auto-renewals, penalty fees, broad liability and one-sided termination rights are highlighted and explained in a sentence.
            </p>
          </div>

          <div style={{ flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                border: '1px solid var(--line3)',
                borderRadius: '14px',
                padding: '18px 20px',
                background: 'var(--inset)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 500 }}>Automatic renewal</span>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '12px',
                    color: 'var(--warn)',
                    border: '1px solid var(--warn-line)',
                    borderRadius: '999px',
                    padding: '4px 10px',
                  }}
                >
                  Review
                </span>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: 1.55, color: 'var(--muted)' }}>
                Renews each year unless you cancel 60 days before. Page 4, section 7.2.
              </p>
            </div>

            <div
              style={{
                border: '1px solid var(--line3)',
                borderRadius: '14px',
                padding: '18px 20px',
                background: 'var(--inset)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 500 }}>Late payment fee</span>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '12px',
                    color: 'var(--bad)',
                    border: '1px solid var(--bad-line)',
                    borderRadius: '999px',
                    padding: '4px 10px',
                  }}
                >
                  High
                </span>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: 1.55, color: 'var(--muted)' }}>
                A flat fee plus daily interest after day 3. Page 6, section 11.
              </p>
            </div>

            <div
              style={{
                border: '1px solid var(--line3)',
                borderRadius: '14px',
                padding: '18px 20px',
                background: 'var(--inset)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 500 }}>Governing law</span>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '12px',
                    color: 'var(--accent)',
                    border: '1px solid var(--acc-line)',
                    borderRadius: '999px',
                    padding: '4px 10px',
                  }}
                >
                  Standard
                </span>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: 1.55, color: 'var(--muted)' }}>
                Disputes follow the law of your state. Page 9, section 18.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section
        id="privacy"
        style={{
          padding: '56px 64px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'center',
          maxWidth: '1120px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>Private by design</span>
          <span style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--muted)' }}>
            Encrypted in transit and at rest. Delete a file any time.
          </span>
        </div>
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>Answers with sources</span>
          <span style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--muted)' }}>
            Every explanation cites the page and section it draws from.
          </span>
        </div>
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>Not a substitute for a lawyer</span>
          <span style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--muted)' }}>
            Plainly explains documents. It does not give legal advice.
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '32px 64px',
          borderTop: '1px solid var(--line2)',
          fontSize: '14px',
          color: 'var(--faint)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <span>2026 Plainly. For information only, not legal advice.</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#privacy">Privacy</a>
          <a href="#how">Terms</a>
          <Link to="/chat" style={{ color: 'var(--accent)' }}>
            Interactive Demo
          </Link>
        </div>
      </footer>

      {/* Space Hint */}
      <div id="space-hint" aria-hidden="true">
        Move your cursor &middot; click to make a wish
      </div>

      <ThemeToggle />
    </div>
  );
};
