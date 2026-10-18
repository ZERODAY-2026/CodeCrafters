import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SpaceCanvas } from '../components/space/SpaceCanvas';
import { ThemeToggle } from '../components/theme/ThemeToggle';
import { useDocumentContext } from '../context/DocumentContext';

export const OverviewPage: React.FC = () => {
  const {
    currentDoc,
    currentChatTitle,
    currentResult,
    history,
    uploadFile,
    selectDocument,
    setActivePage,
    isUploading,
    backendHealth,
  } = useDocumentContext();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await uploadFile(files[0]);
    }
  };

  const isLease =
    currentDoc?.filename.toLowerCase().includes('lease') ||
    currentDoc?.document_id.includes('lease') ||
    currentChatTitle.includes('lease');

  const overallSummaryText =
    currentResult?.document_summary?.overall_summary ||
    (isLease
      ? 'A 12-month apartment lease with automatic renewal. You agree to rent the apartment from February 1, 2027 for $1,850 a month. You pay a $3,700 deposit up front. The lease renews on its own each year unless you give 60 days’ written notice.'
      : `This document contains ${currentDoc?.total_pages || 1} pages parsed with PyMuPDF/RapidOCR. Key obligations, payment timelines, and dispute terms have been indexed for interactive exploration.`);

  const pageSummaries = currentResult?.document_summary?.page_summaries || [];

  return (
    <div className="space relative isolate overflow-x-hidden text-[var(--text)] font-sans min-h-screen flex flex-col">
      <SpaceCanvas showSatellite={false} />

      {/* Header */}
      <header className="flex flex-wrap gap-4 items-center justify-between px-6 sm:px-12 py-5 border-b border-[var(--line2)] z-10">
        <Link to="/" className="flex items-center gap-3 text-[var(--text)] hover:text-[var(--text)]">
          <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <path
              d="M6 3h10l5 5v15H6z"
              stroke="currentColor"
              className="text-[var(--accent)]"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M10 13h8M10 17h8" stroke="currentColor" className="text-[var(--accent)]" strokeWidth="1.5" />
          </svg>
          <span className="text-[18px] font-medium">Plainly</span>
        </Link>

        {/* Backend health status badge */}
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--muted)] bg-[var(--panel)] px-3 py-1.5 rounded-full border border-[var(--line3)]">
          <span
            className={`w-2 h-2 rounded-full ${
              backendHealth.ok ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>
            {backendHealth.ok
              ? `Backend Connected (${backendHealth.model || 'gemma4:e4b'})`
              : 'Standalone / Fallback Mode'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/chat"
            className="flex items-center gap-2 text-sm font-medium text-[var(--on-accent)] bg-[var(--accent)] hover:opacity-90 px-4 py-2 rounded-full transition-all shadow"
          >
            <span>Ask questions</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-6 sm:p-10 md:p-12 flex flex-col gap-8 max-w-[1240px] w-full mx-auto box-border z-10">
        {/* Document Status Banner */}
        <div className="flex flex-wrap gap-5 items-center justify-between border border-[var(--line)] rounded-2xl bg-[var(--panel)] backdrop-blur-md p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-[52px] border-1.5 border-[var(--accent)] rounded-lg flex items-center justify-center font-mono text-xs text-[var(--accent)] font-semibold uppercase bg-[var(--inset)]">
              {currentDoc?.filename.toLowerCase().endsWith('.txt') ? 'TXT' : 'PDF'}
            </div>
            <div className="min-w-0">
              <div className="text-[18px] font-medium truncate text-[var(--text)]">
                {currentDoc?.filename || 'Residential_Lease_2026.pdf'}
              </div>
              <div className="text-sm text-[var(--muted)] mt-1">
                {currentDoc?.total_pages || 1} {currentDoc?.total_pages === 1 ? 'page' : 'pages'} &middot; Session:{' '}
                <span className="font-mono text-xs text-[var(--accent)]">{currentChatTitle}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 min-w-[240px] flex-0 sm:flex-1 max-w-xs">
            <div className="flex-1 h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
              <div className="w-full h-full bg-[var(--accent)] rounded-full"></div>
            </div>
            <span className="font-mono text-xs text-[var(--accent)] border border-[var(--acc-line)] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
              {backendHealth.ocrEngine || 'RapidOCR Ready'} &middot; Analyzed
            </span>
          </div>
        </div>

        {/* Content Columns */}
        <div className="flex flex-wrap gap-6 items-start">
          {/* Left Column: Plain-English Summary */}
          <section className="flex-[2] min-w-[320px] sm:min-w-[540px] flex flex-col gap-6">
            <div>
              <div className="text-xs tracking-widest uppercase text-[var(--accent)] font-medium mb-3">
                Plain-English rolling summary
              </div>
              <h1 className="m-0 mb-4 font-serif font-normal text-4xl sm:text-5xl leading-tight tracking-tight text-[var(--text)]">
                {isLease
                  ? 'A 12-month apartment lease with automatic renewal.'
                  : `Structured agreement overview: ${currentDoc?.filename}`}
              </h1>
              <p className="m-0 text-lg leading-relaxed text-[var(--text3)] font-light">
                {overallSummaryText}
              </p>
            </div>

            {/* Quick Stat Cards */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[170px] border border-[var(--line)] rounded-xl bg-[var(--panel)] backdrop-blur-md p-5">
                <div className="text-xs text-[var(--muted)]">Document type</div>
                <div className="text-[17px] font-medium mt-2 text-[var(--text)]">
                  {isLease ? 'Residential lease' : 'Legal Agreement'}
                </div>
              </div>
              <div className="flex-1 min-w-[170px] border border-[var(--line)] rounded-xl bg-[var(--panel)] backdrop-blur-md p-5">
                <div className="text-xs text-[var(--muted)]">Session ID</div>
                <div className="text-[15px] font-mono truncate mt-2 text-[var(--text)]" title={currentChatTitle}>
                  {currentChatTitle}
                </div>
              </div>
              <div className="flex-1 min-w-[170px] border border-[var(--line)] rounded-xl bg-[var(--panel)] backdrop-blur-md p-5">
                <div className="text-xs text-[var(--muted)]">Total Pages</div>
                <div className="text-[17px] font-medium mt-2 text-[var(--text)]">
                  {currentDoc?.total_pages || 1} {currentDoc?.total_pages === 1 ? 'page' : 'pages'}
                </div>
              </div>
            </div>

            {/* Page-by-Page Rolling Summaries (Backend Extra Feature Exposed) */}
            {pageSummaries.length > 0 && (
              <div className="border border-[var(--line)] rounded-2xl bg-[var(--panel)] backdrop-blur-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[16px] font-medium text-[var(--text)]">
                    Page-by-Page Rolling Summaries
                  </div>
                  <span className="font-mono text-xs text-[var(--muted)]">
                    {pageSummaries.length} {pageSummaries.length === 1 ? 'page' : 'pages'} summarized
                  </span>
                </div>
                <div className="space-y-3">
                  {pageSummaries.map((ps) => (
                    <div
                      key={ps.page}
                      className="p-3.5 rounded-xl border border-[var(--line2)] bg-[var(--inset)] hover:border-[var(--acc-line)] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-semibold text-[var(--accent)]">
                          Page {ps.page}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActivePage(ps.page);
                            navigate('/chat');
                          }}
                          className="text-xs text-[var(--muted)] hover:text-[var(--accent)] underline cursor-pointer"
                        >
                          View in Chat &rarr;
                        </button>
                      </div>
                      <p className="m-0 text-sm leading-relaxed text-[var(--text2)]">
                        {ps.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Dates Table */}
            <div className="border border-[var(--line)] rounded-2xl bg-[var(--panel)] backdrop-blur-md p-6">
              <div className="text-[16px] font-medium mb-3 text-[var(--text)]">Key dates & deadlines</div>
              <div className="flex justify-between gap-4 py-3 border-t border-[var(--line2)] text-[15px]">
                <span>Lease commencement</span>
                <span className="font-mono text-[var(--muted)]">Feb 1, 2027</span>
              </div>
              <div className="flex justify-between gap-4 py-3 border-t border-[var(--line2)] text-[15px]">
                <span>Rent due each month</span>
                <span className="font-mono text-[var(--muted)]">1st calendar day</span>
              </div>
              <div className="flex justify-between gap-4 py-3 border-t border-[var(--line2)] text-[15px]">
                <span>Last day to cancel renewal</span>
                <span className="font-mono text-[var(--warn)] font-medium">Dec 3, 2027</span>
              </div>
            </div>

            {/* Obligations Summary */}
            <div className="border border-[var(--line)] rounded-2xl bg-[var(--panel)] backdrop-blur-md p-6">
              <div className="text-[16px] font-medium mb-3 text-[var(--text)]">Core obligations breakdown</div>
              <ul className="m-0 p-0 list-none space-y-3 text-sm text-[var(--text3)]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[var(--accent)] font-bold">&bull;</span>
                  <span><strong>Monthly rent:</strong> $1,850 due on the 1st. Late fee of $150 plus 1.5% daily after the 3rd.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[var(--accent)] font-bold">&bull;</span>
                  <span><strong>Deposit:</strong> $3,700 held in escrow, refundable within 21 days after lease termination.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[var(--accent)] font-bold">&bull;</span>
                  <span><strong>Early move-out:</strong> Requires 60 days’ written notice plus a mandatory 2-month buyout fee ($3,700).</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Right Column: Risk Flags & Action CTA */}
          <aside className="flex-1 min-w-[300px] flex flex-col gap-6">
            {/* Risk Flagged Clauses */}
            <div className="border border-[var(--line)] rounded-2xl bg-[var(--panel)] backdrop-blur-md p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[16px] font-medium text-[var(--text)]">Flagged clauses</span>
                <span className="text-xs font-mono text-[var(--muted)]">3 items found</span>
              </div>

              <div className="border border-[var(--line3)] rounded-xl p-4 bg-[var(--inset)]">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text)]">Automatic renewal</span>
                  <span className="font-mono text-xs text-[var(--warn)] border border-[var(--warn-line)] rounded-full px-2 py-0.5">
                    Review
                  </span>
                </div>
                <p className="mt-2 mb-0 text-xs text-[var(--muted)] leading-relaxed">
                  Renews each year unless cancelled 60 days in advance. Page 4, section 7.2.
                </p>
              </div>

              <div className="border border-[var(--line3)] rounded-xl p-4 bg-[var(--inset)]">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text)]">Late payment fee</span>
                  <span className="font-mono text-xs text-[var(--bad)] border border-[var(--bad-line)] rounded-full px-2 py-0.5">
                    High
                  </span>
                </div>
                <p className="mt-2 mb-0 text-xs text-[var(--muted)] leading-relaxed">
                  $150 flat penalty plus daily interest after day 3. Page 6, section 11.
                </p>
              </div>

              <div className="border border-[var(--line3)] rounded-xl p-4 bg-[var(--inset)]">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text)]">Governing law</span>
                  <span className="font-mono text-xs text-[var(--accent)] border border-[var(--acc-line)] rounded-full px-2 py-0.5">
                    Standard
                  </span>
                </div>
                <p className="mt-2 mb-0 text-xs text-[var(--muted)] leading-relaxed">
                  Local municipal state jurisdiction applies. Page 9, section 18.
                </p>
              </div>
            </div>

            {/* Interactive Chat CTA */}
            <div className="border border-[var(--line)] rounded-2xl bg-[var(--panel)] backdrop-blur-md p-6 flex flex-col gap-4 text-center items-center">
              <div className="w-12 h-12 rounded-full border border-[var(--accent)] flex items-center justify-center text-[var(--accent)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>

              <div>
                <div className="text-[17px] font-medium text-[var(--text)]">
                  Have specific questions?
                </div>
                <p className="text-xs text-[var(--muted)] mt-1 max-w-xs">
                  Ask Plainly about termination rights, deposit refunds, or liability. Every answer cites the exact line in your document.
                </p>
              </div>

              <Link
                to="/chat"
                className="w-full text-center py-3 px-6 rounded-full font-medium text-sm text-[var(--on-accent)] bg-[var(--accent)] hover:opacity-90 transition-opacity cursor-pointer shadow"
              >
                Open interactive document chat &rarr;
              </Link>
            </div>

            {/* Document Switcher / Upload New with Backend Sessions */}
            <div className="border border-[var(--line)] rounded-2xl bg-[var(--panel)] backdrop-blur-md p-5 flex flex-col gap-3">
              <span className="text-xs font-mono uppercase text-[var(--faint)]">Saved Sessions</span>
              <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
                {history.map((doc) => {
                  const isActive = (doc.chat_title || doc.document_id) === currentChatTitle;
                  return (
                    <button
                      key={doc.chat_title || doc.document_id}
                      type="button"
                      onClick={async () => {
                        await selectDocument(doc.chat_title || doc.document_id);
                      }}
                      className={`text-left p-2.5 rounded-lg text-xs transition-colors flex justify-between items-center ${
                        isActive
                          ? 'bg-[var(--hover)] text-[var(--text)] font-medium border border-[var(--line3)]'
                          : 'text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      <span className="truncate max-w-[180px]">{doc.filename}</span>
                      <span className="font-mono text-[10px] text-[var(--faint)]">
                        {doc.timestamp || 'Saved'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadNew}
                accept=".pdf,.txt"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-2 text-xs font-medium text-[var(--accent)] border border-[var(--acc-line)] rounded-lg py-2 hover:bg-[var(--accent)]/10 transition-colors cursor-pointer"
              >
                {isUploading ? 'Uploading...' : '+ Upload different PDF or TXT'}
              </button>
            </div>
          </aside>
        </div>
      </main>

      <ThemeToggle />
    </div>
  );
};
