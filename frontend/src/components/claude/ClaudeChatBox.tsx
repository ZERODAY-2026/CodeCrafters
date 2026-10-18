import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentContext } from '../../context/DocumentContext';

const HERO_PROMPTS = [
  {
    label: 'Analyze lease obligations',
    icon: '📄',
    prompt: 'Summarize the core obligations, rent schedule, and term of this lease agreement.',
  },
  {
    label: 'Check automatic renewals',
    icon: '⚠️',
    prompt: 'Does this contract contain an automatic renewal or rollover clause?',
  },
  {
    label: 'Deposit refund conditions',
    icon: '💰',
    prompt: 'Under what conditions and timeline do I get my security deposit back?',
  },
  {
    label: 'Early termination penalty',
    icon: '🚪',
    prompt: 'What are the required notice periods and fee for ending this agreement early?',
  },
];

export const ClaudeChatBox: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const { uploadFile, uploadRawText, isUploading, uploadProgress, uploadError, sendQuery } = useDocumentContext();
  const navigate = useNavigate();

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea height as user types or pastes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(Math.max(textareaRef.current.scrollHeight, 52), 240)}px`;
    }
  }, [inputText]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      try {
        await uploadFile(files[0]);
        navigate('/overview');
      } catch {}
    }
  };

  const handleSendPrompt = async () => {
    if (!inputText.trim() || isUploading) return;
    const text = inputText.trim();
    setInputText('');

    // If it looks like a pasted document or clause (longer than 400 chars), treat as document text
    if (text.length > 400) {
      try {
        await uploadRawText(text, 'Pasted_Document.txt');
        navigate('/overview');
      } catch {
        navigate('/chat');
      }
    } else {
      // Query or question prompt: navigate to chat and send query
      navigate('/chat');
      sendQuery(text);
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    setInputText(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      try {
        await uploadFile(files[0]);
        navigate('/overview');
      } catch {}
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '780px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        margin: '0 auto',
      }}
    >
      {/* Hidden file picker for guaranteed clickability */}
      <input
        type="file"
        ref={pdfInputRef}
        accept=".pdf,.txt,text/plain,application/pdf"
        onChange={handlePdfUpload}
        style={{ display: 'none' }}
      />

      {/* Claude Greeting Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 'clamp(38px, 5vw, 54px)',
          fontWeight: 400,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
        }}
      >
        <span
          style={{
            color: 'var(--accent)',
            fontSize: '38px',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {/* Starburst icon */}
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
          </svg>
        </span>
        <span>{getGreeting()}</span>
      </div>

      {/* Claude Style Input Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          width: '100%',
          border: isDragOver ? '1.5px dashed var(--accent)' : '1px solid var(--line3)',
          borderRadius: '20px',
          background: isDragOver ? 'var(--hover)' : 'var(--panel)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '18px 20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Uploading progress notification */}
        {isUploading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'var(--inset)',
              border: '1px solid var(--acc-line)',
              fontSize: '13px',
              fontFamily: "'Geist Mono', monospace",
              color: 'var(--accent)',
            }}
          >
            <span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span>
            <span>Parsing document clauses... {uploadProgress}%</span>
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="How can I help you today? Paste contract clauses or ask any question..."
          rows={1}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '16px',
            lineHeight: 1.55,
            color: 'var(--text)',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            minHeight: '48px',
            transition: 'height 0.15s ease',
          }}
        />

        {/* Mode Feedback Badge */}
        {inputText.trim().length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              paddingTop: '2px',
            }}
          >
            {inputText.trim().length > 400 ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontFamily: "'Geist Mono', monospace",
                  color: 'var(--accent)',
                  background: 'var(--inset)',
                  border: '1px solid var(--acc-line)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '13px' }}>📄</span>
                <span>
                  <strong>Pasted document detected</strong> &middot; Auto-parse clauses on send
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontFamily: "'Geist Mono', monospace",
                  color: 'var(--muted)',
                  background: 'var(--inset)',
                  border: '1px solid var(--line3)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '13px' }}>💬</span>
                <span>
                  <strong>Question mode</strong>
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setInputText('')}
              style={{
                fontSize: '11px',
                fontFamily: "'Geist Mono', monospace",
                color: 'var(--faint)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Bottom Toolbar matching Claude UI */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            paddingTop: '8px',
            borderTop: '1px solid var(--line2)',
          }}
        >
          {/* Left Button: In place of plus sign, clean Upload PDF button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Upload PDF Button */}
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={isUploading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--on-accent)',
                background: 'var(--accent)',
                padding: '8px 16px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2v12M2 8h12" />
              </svg>
              <span>Upload PDF</span>
            </button>
          </div>

          {/* Right Controls: Model Pill (gemma4:4b) + Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Model Pill: gemma4:4b */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontFamily: "'Geist Mono', monospace",
                color: 'var(--text3)',
                background: 'var(--inset)',
                border: '1px solid var(--line3)',
                padding: '5px 12px',
                borderRadius: '999px',
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
              <span style={{ fontWeight: 500 }}>gemma4:4b</span>
            </div>

            {/* Audio / Mic Icon */}
            <button
              type="button"
              aria-label="Voice input"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '8px',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSendPrompt}
              disabled={!inputText.trim() || isUploading}
              aria-label="Send prompt"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                border: 'none',
                background: inputText.trim() ? 'var(--accent)' : 'var(--bubble)',
                color: inputText.trim() ? 'var(--on-accent)' : 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 15V3M4 8l5-5 5 5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Quick Prompt Chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {HERO_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPrompt(item.prompt)}
            className="quick-prompt-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontFamily: "'Geist', system-ui, sans-serif",
              color: 'var(--muted)',
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: '999px',
              padding: '6px 14px',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {uploadError && (
        <div
          style={{
            fontSize: '13px',
            color: 'var(--bad)',
            border: '1px solid var(--bad-line)',
            background: 'var(--inset)',
            borderRadius: '8px',
            padding: '8px 16px',
          }}
        >
          {uploadError}
        </div>
      )}
    </div>
  );
};
