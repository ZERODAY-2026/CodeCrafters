import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentContext } from '../../context/DocumentContext';

export const PlainlyDropzone: React.FC = () => {
  const { uploadFile, isUploading, uploadProgress, uploadError } = useDocumentContext();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    try {
      await uploadFile(file);
      navigate('/overview');
    } catch {}
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const openFileDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '720px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        marginTop: '16px',
      }}
    >
      {/* Explicit native input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept=".pdf,.txt,text/plain,application/pdf"
        style={{ display: 'none' }}
      />

      <div
        onClick={openFileDialog}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          width: '100%',
          border: isDragOver ? '1.5px dashed var(--accent)' : '1.5px dashed var(--line5)',
          borderRadius: '20px',
          background: isDragOver ? 'var(--hover)' : 'var(--panel)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '40px 32px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          cursor: isUploading ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
            <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--accent)' }}>
              Analyzing document... {uploadProgress}%
            </div>
            <div
              style={{
                width: '100%',
                maxWidth: '360px',
                height: '6px',
                background: 'var(--line)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: "'Geist Mono', monospace" }}>
              Extracting clauses &amp; terms with gemma4:4b
            </div>
          </div>
        ) : (
          <>
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              stroke="currentColor"
              style={{ color: 'var(--accent)' }}
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M18 24V8M11 14l7-7 7 7" />
              <path d="M6 24v4a2 2 0 002 2h20a2 2 0 002-2v-4" />
            </svg>
            <div style={{ fontSize: '18px', fontWeight: 500 }}>
              {isDragOver ? 'Release to upload PDF or TXT' : 'Drop your PDF or plain text here'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
              Supports PDF and TXT (.txt). Up to 100 pages, 25 MB.
            </div>
            <button
              type="button"
              onClick={openFileDialog}
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--on-accent)',
                background: 'var(--accent)',
                padding: '14px 28px',
                borderRadius: '999px',
                border: 'none',
                marginTop: '4px',
                cursor: 'pointer',
              }}
            >
              Choose a PDF or Text file
            </button>
          </>
        )}
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

      <div style={{ fontSize: '13px', color: 'var(--faint)' }}>
        Your file is encrypted and never used to train models.
      </div>
    </div>
  );
};
