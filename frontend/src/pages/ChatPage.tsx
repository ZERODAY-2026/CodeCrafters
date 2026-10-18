import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SpaceCanvas } from '../components/space/SpaceCanvas';
import { ThemeToggle } from '../components/theme/ThemeToggle';
import { useDocumentContext } from '../context/DocumentContext';
import type { Citation } from '../types/triage';

export const ChatPage: React.FC = () => {
  const {
    currentDoc,
    currentChatTitle,
    currentResult,
    history,
    selectDocument,
    uploadFile,
    isUploading,
    messages,
    sendQuery,
    isQuerying,
    activeCitation,
    setActiveCitation,
    activePage,
    setActivePage,
    startNewChat,
    backendHealth,
  } = useDocumentContext();

  const [inputText, setInputText] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [pulsingCitation, setPulsingCitation] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 960;

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'Who pays for repairs?',
    'When do I get my deposit back?',
    'Can I have a pet?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isQuerying]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isQuerying) return;
    const q = inputText;
    setInputText('');
    await sendQuery(q);
  };

  const handlePromptClick = async (prompt: string) => {
    if (isQuerying) return;
    await sendQuery(prompt);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await uploadFile(files[0]);
    }
  };

  const handleCitationClick = (citation: Citation) => {
    setActiveCitation(citation);
    setActivePage(citation.page);
    setPulsingCitation(true);
    if (isMobile) {
      setActiveTab('preview');
    }
    setTimeout(() => setPulsingCitation(false), 1500);
  };

  // Determine current active page content dynamically from the ingested document
  const totalPages = currentDoc?.total_pages || (currentDoc?.pages?.length || 1);
  const activePageObj =
    currentDoc?.pages?.find((p) => p.page_number === activePage) ||
    currentDoc?.pages?.[0];

  const currentPageSummary = currentResult?.document_summary?.page_summaries?.find(
    (ps) => ps.page === activePage
  );

  return (
    <div
      className="space"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        color: 'var(--text)',
        fontFamily: "'Geist', system-ui, sans-serif",
        minHeight: '100vh',
      }}
    >
      {/* Space canvas background without satellite so it never collides with chat */}
      <SpaceCanvas showSatellite={false} />

      {/* Mobile Drawer Backdrop */}
      {isMobile && showMobileSidebar && (
        <div
          onClick={() => setShowMobileSidebar(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
        />
      )}

      {/* Left Sidebar */}
      <aside
        style={{
          flex: isMobile ? 'none' : '0 0 260px',
          width: isMobile ? '280px' : 'auto',
          position: isMobile ? 'fixed' : 'relative',
          top: 0,
          bottom: 0,
          left: 0,
          transform: isMobile ? (showMobileSidebar ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
          padding: '24px 16px',
          borderRight: '1.5px solid var(--line2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          background: isMobile ? 'var(--bg)' : 'transparent',
          zIndex: isMobile ? 50 : 2,
          boxShadow: isMobile && showMobileSidebar ? '0 0 40px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--text)',
              textDecoration: 'none',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <path
                d="M6 3h10l5 5v15H6z"
                stroke="currentColor"
                style={{ color: 'var(--accent)' }}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M10 13h8M10 17h8" stroke="currentColor" style={{ color: 'var(--accent)' }} strokeWidth="1.5" />
            </svg>
            <span style={{ fontSize: '18px', fontWeight: 500 }}>Plainly</span>
          </Link>

          {isMobile && (
            <button
              type="button"
              onClick={() => setShowMobileSidebar(false)}
              aria-label="Close sidebar"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px 8px',
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.txt"
          style={{ display: 'none' }}
        />

        <Link
          to="/"
          onClick={startNewChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--on-accent)',
            background: 'var(--accent)',
            padding: '12px 16px',
            borderRadius: '12px',
            minHeight: '20px',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'opacity 0.2s ease, transform 0.15s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M8 2v12M2 8h12" />
          </svg>
          <span>New chat</span>
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
            <span
              style={{
                fontSize: '12px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--faint)',
              }}
            >
              Saved Sessions
            </span>
            <span style={{ fontSize: '11px', fontFamily: "'Geist Mono', monospace", color: 'var(--muted)' }}>
              {history.filter((doc) => doc.filename.toLowerCase().includes(docSearch.toLowerCase())).length}
            </span>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', margin: '0 4px 4px' }}>
            <input
              type="text"
              placeholder="Search documents..."
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 28px',
                borderRadius: '8px',
                border: '1px solid var(--line3)',
                background: 'var(--inset)',
                color: 'var(--text)',
                fontSize: '12px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '50vh', overflowY: 'auto' }}>
            {history
              .filter((doc) => doc.filename.toLowerCase().includes(docSearch.toLowerCase()))
              .map((doc) => {
                const key = doc.chat_title || doc.document_id;
                const isActive = key === currentChatTitle || doc.document_id === currentDoc?.document_id;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={async () => {
                      await selectDocument(key);
                      if (isMobile) setShowMobileSidebar(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: isActive ? 'var(--hover)' : 'transparent',
                      border: isActive ? '1px solid var(--line3)' : '1px solid transparent',
                      color: 'var(--text)',
                      minHeight: '20px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.filename}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: isActive ? 'var(--muted)' : 'var(--faint)' }}>
                      <span>{doc.timestamp || 'Saved'}</span>
                      {doc.chat_title && <span style={{ fontFamily: "'Geist Mono', monospace" }}>{doc.chat_title.slice(0, 16)}</span>}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--line2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/overview" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>
            &larr; Document summary
          </Link>
          <Link to="/" style={{ fontSize: '13px', color: 'var(--faint)', textDecoration: 'none' }}>
            Landing page
          </Link>
        </div>
      </aside>

      {/* Main Chat Stream */}
      <main
        style={{
          flex: '999 1 560px',
          minWidth: 0,
          boxSizing: 'border-box',
          display: isMobile && activeTab === 'preview' ? 'none' : 'flex',
          flexDirection: 'column',
          borderRight: isMobile ? 'none' : '1.5px solid var(--line2)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isMobile ? '12px 16px' : '18px 32px',
            borderBottom: '1.5px solid var(--line2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button
                type="button"
                onClick={() => setShowMobileSidebar(true)}
                aria-label="Open documents sidebar"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--line3)',
                  color: 'var(--text)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>☰</span>
                <span style={{ fontFamily: "'Geist Mono', monospace" }}>Docs</span>
              </button>
            )}

            <div>
              <div style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 500 }}>
                {currentDoc?.filename || 'Residential Lease 2026'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                Session: <span style={{ fontFamily: "'Geist Mono', monospace", color: 'var(--accent)' }}>{currentChatTitle}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Mobile Tab Switcher */}
            {isMobile && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--inset)',
                  border: '1px solid var(--line3)',
                  borderRadius: '999px',
                  padding: '3px',
                  gap: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 500,
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === 'chat' ? 'var(--accent)' : 'transparent',
                    color: activeTab === 'chat' ? 'var(--on-accent)' : 'var(--muted)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>💬 Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 500,
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === 'preview' ? 'var(--accent)' : 'transparent',
                    color: activeTab === 'preview' ? 'var(--on-accent)' : 'var(--muted)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>📄 Source</span>
                  {pulsingCitation && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: activeTab === 'preview' ? 'var(--on-accent)' : 'var(--accent)',
                        display: 'inline-block',
                      }}
                    />
                  )}
                </button>
              </div>
            )}

            {!isMobile && (
              <>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '12px',
                    color: backendHealth.ok ? 'var(--text3)' : 'var(--muted)',
                    border: '1px solid var(--line3)',
                    background: 'var(--inset)',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: backendHealth.ok ? 'var(--accent)' : '#EAB308',
                    }}
                  />
                  {backendHealth.ok ? (backendHealth.model || 'gemma4:e4b') : 'Offline / Demo'}
                </span>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '12px',
                    color: 'var(--accent)',
                    border: '1px solid var(--acc-line)',
                    borderRadius: '999px',
                    padding: '6px 12px',
                  }}
                >
                  Hybrid QA Active
                </span>
              </>
            )}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            overflowY: 'auto',
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                textAlign: 'center',
                gap: '14px',
                padding: '40px 20px',
                margin: 'auto 0',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '1px solid var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  background: 'var(--panel)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 3h10l5 5v15H6z" strokeLinejoin="round" />
                  <path d="M10 13h8M10 17h8" />
                </svg>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 400, color: 'var(--text)', fontFamily: "'Instrument Serif', Georgia, serif" }}>
                New conversation
              </div>
              <div style={{ fontSize: '15px', maxWidth: '440px', lineHeight: 1.6, color: 'var(--muted)' }}>
                Ask anything about {currentDoc?.filename || 'this document'} or select one of the suggested prompts below to get started.
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: 'flex-end',
                      maxWidth: '520px',
                      background: 'var(--bubble)',
                      borderRadius: '18px 18px 4px 18px',
                      padding: '14px 18px',
                      fontSize: '16px',
                      lineHeight: 1.55,
                    }}
                  >
                    {msg.text}
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: 'flex-start',
                    maxWidth: '680px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: '1px solid var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                          <path d="M6 3h10l5 5v15H6z" stroke="currentColor" style={{ color: 'var(--accent)' }} strokeWidth="2" />
                        </svg>
                      </span>
                      <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Plainly</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      title="Copy explanation"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '12px',
                        fontFamily: "'Geist Mono', monospace",
                        color: copiedId === msg.id ? 'var(--accent)' : 'var(--muted)',
                        background: copiedId === msg.id ? 'var(--inset)' : 'transparent',
                        border: copiedId === msg.id ? '1px solid var(--acc-line)' : '1px solid transparent',
                        cursor: 'pointer',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div style={{ fontSize: '17px', lineHeight: 1.7, color: 'var(--text2)' }}>
                    {msg.text.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} style={{ margin: '0 0 10px' }}>
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {msg.citations && msg.citations.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {msg.citations.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleCitationClick(c)}
                          title={c.quote}
                          style={{
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '13px',
                            color: 'var(--accent)',
                            border: '1px solid var(--acc-line)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            minHeight: '20px',
                            background: 'var(--inset)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            maxWidth: '100%',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>p. {c.page}</span>
                          <span style={{ color: 'var(--muted)' }}>&middot;</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
                            &ldquo;{c.quote}&rdquo;
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.warning && (
                    <div
                      style={{
                        border: '1px solid var(--warn-line)',
                        background: 'var(--warn-bg)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        fontSize: '14px',
                        lineHeight: 1.55,
                        color: 'var(--warn-text)',
                      }}
                    >
                      {msg.warning}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isQuerying && (
            <div
              style={{
                alignSelf: 'flex-start',
                maxWidth: '680px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '4px 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: '1px solid var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--inset)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                    <path d="M6 3h10l5 5v15H6z" stroke="currentColor" style={{ color: 'var(--accent)' }} strokeWidth="2" />
                  </svg>
                </span>
                <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 500 }}>Plainly</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  background: 'var(--panel)',
                  border: '1px solid var(--line3)',
                  fontSize: '14px',
                  color: 'var(--muted)',
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                <span className="animate-spin">⟳</span>
                <span>Retrieving relevant clauses & verifying citations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px 32px 24px', borderTop: '1.5px solid var(--line2)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="quick-prompt-pill"
                onClick={() => handlePromptClick(prompt)}
                disabled={isQuerying}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  color: 'var(--text3)',
                  background: 'var(--panel)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid var(--line4)',
                  borderRadius: '999px',
                  padding: '10px 14px',
                  minHeight: '44px',
                  cursor: 'pointer',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid var(--line3)',
                borderRadius: '16px',
                background: 'var(--panel)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                padding: '10px 10px 10px 20px',
              }}
            >
              <label htmlFor="ask" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                Ask a question about this document
              </label>
              <input
                id="ask"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask anything about ${currentDoc?.filename || 'this document'}...`}
                disabled={isQuerying}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  fontFamily: 'inherit',
                  fontSize: '16px',
                  color: 'var(--text)',
                  minHeight: '44px',
                }}
              />
              <button
                type="submit"
                disabled={isQuerying || !inputText.trim()}
                aria-label="Send question"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  border: 0,
                  background: 'var(--accent)',
                  color: 'var(--on-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: isQuerying || !inputText.trim() ? 0.4 : 1,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M9 15V3M4 8l5-5 5 5" />
                </svg>
              </button>
            </div>
          </form>

          <div style={{ fontSize: '12px', color: 'var(--faint)', textAlign: 'center', marginTop: '10px' }}>
            Plainly extracts verbatim clauses and provides objective analysis. Verified citations are linked above.
          </div>
        </div>
      </main>

      {/* Right Column: Source Preview */}
      <aside
        style={{
          flex: isMobile ? '1 1 100%' : '1 1 340px',
          maxWidth: isMobile ? '100%' : '440px',
          minWidth: 0,
          boxSizing: 'border-box',
          padding: isMobile ? '16px' : '24px',
          display: isMobile && activeTab === 'chat' ? 'none' : 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {isMobile && (
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--on-accent)',
              background: 'var(--accent)',
              borderRadius: '999px',
              padding: '8px 16px',
              border: 'none',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            <span>&larr;</span>
            <span>Return to Chat</span>
          </button>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 500 }}>Source preview</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: "'Geist Mono', monospace", color: 'var(--muted)' }}>
            <button
              type="button"
              onClick={() => setActivePage(Math.max(1, activePage - 1))}
              disabled={activePage <= 1}
              style={{ border: 'none', background: 'transparent', color: 'inherit', cursor: activePage <= 1 ? 'not-allowed' : 'pointer', opacity: activePage <= 1 ? 0.4 : 1 }}
            >
              &larr; Prev
            </button>
            <span style={{ color: 'var(--text)' }}>
              p. {activePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setActivePage(Math.min(totalPages, activePage + 1))}
              disabled={activePage >= totalPages}
              style={{ border: 'none', background: 'transparent', color: 'inherit', cursor: activePage >= totalPages ? 'not-allowed' : 'pointer', opacity: activePage >= totalPages ? 0.4 : 1 }}
            >
              Next &rarr;
            </button>
            <div style={{ width: '1px', height: '14px', background: 'var(--line2)', margin: '0 2px' }} />
            <button
              type="button"
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
              title={`Switch to ${fontSize === 'normal' ? 'larger' : 'normal'} text`}
              style={{
                border: '1px solid var(--line3)',
                background: fontSize === 'large' ? 'var(--accent)' : 'var(--inset)',
                color: fontSize === 'large' ? 'var(--on-accent)' : 'var(--text3)',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 7px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              A{fontSize === 'large' ? '-' : '+'}
            </button>
          </div>
        </div>

        {/* Real Document Page View */}
        <div
          className={pulsingCitation ? 'citation-pulse-highlight' : ''}
          style={{
            border: '1px solid var(--line)',
            borderRadius: '14px',
            background: '#F2EFE8',
            color: '#1A1A18',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            fontFamily: "'Instrument Serif', Georgia, serif",
            transition: 'all 0.25s ease',
            maxHeight: '480px',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Geist', system-ui, sans-serif", color: '#6A675F' }}>
              Page {activePage} {activePageObj?.ocr_applied ? '(OCR Processed)' : ''}
            </span>
            {activeCitation && activeCitation.page === activePage && (
              <span style={{ fontSize: '11px', fontFamily: "'Geist Mono', monospace", color: '#8A5A00', background: '#F8ECC2', padding: '2px 7px', borderRadius: '4px' }}>
                Active citation
              </span>
            )}
          </div>

          {/* Active Citation Highlight Card */}
          {activeCitation && activeCitation.page === activePage && (
            <div
              className={pulsingCitation ? 'citation-pulse-highlight' : ''}
              style={{
                fontSize: fontSize === 'large' ? '17px' : '15px',
                lineHeight: 1.6,
                color: '#1A1A18',
                background: pulsingCitation ? '#FFE699' : '#F6E2A6',
                borderLeft: '3px solid #D4A359',
                padding: '10px 14px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: "'Geist Mono', monospace", textTransform: 'uppercase', color: '#8A5A00', marginBottom: '4px' }}>
                Verified Quote on Page {activeCitation.page}:
              </div>
              <span>&ldquo;{activeCitation.quote}&rdquo;</span>
            </div>
          )}

          {/* Real Page Text */}
          <div
            style={{
              fontSize: fontSize === 'large' ? '17px' : '15px',
              lineHeight: 1.65,
              color: '#2A2824',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {activePageObj?.text ||
              (activePage === 5
                ? 'Section 9.1 Tenant may terminate this Lease before the end of the Term by giving the Landlord sixty (60) days written notice and paying a fee equal to two (2) months Rent.'
                : 'Section 4.2 Each Tenant executing this lease shall be jointly and severally liable for the full and timely performance of all tenant covenants and rental sums without division.')}
          </div>
        </div>

        {/* Page Rolling Summary Card if available */}
        {currentPageSummary && (
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '14px',
              background: 'var(--panel)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', fontFamily: "'Geist Mono', monospace" }}>
              Page {activePage} Rolling Summary
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.55, color: 'var(--text2)' }}>
              {currentPageSummary.summary}
            </div>
          </div>
        )}

        {/* Key Terms or Session Summary */}
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: '14px',
            background: 'var(--panel)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 500 }}>
            {currentResult?.document_summary?.overall_summary ? 'Overall AI Synthesis' : 'Key terms in this lease'}
          </div>
          {currentResult?.document_summary?.overall_summary ? (
            <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text3)' }}>
              {currentResult.document_summary.overall_summary}
            </div>
          ) : (
            <>
              <div style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--muted)' }}>
                <span style={{ color: 'var(--text)' }}>Security deposit.</span> Money held against damage, returned after you move out.
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--muted)' }}>
                <span style={{ color: 'var(--text)' }}>Holdover.</span> Staying after the lease ends, usually at a higher rent.
              </div>
            </>
          )}
        </div>
      </aside>

      <ThemeToggle />
    </div>
  );
};
