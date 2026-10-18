# Plainly Frontend

Modern React 19 + TypeScript + Vite user interface for the **Plainly Legal Document Triage Agent**.

## Features
- **Claude-style Document Dropzone & Chat Input**: Drag-and-drop PDFs/TXT or paste text directly.
- **Rolling Summarization View**: Interactive overview with overall synthesis and per-page breakdown.
- **Objective Legal QA with Citation Jumps**: Verbatim quotes with direct jumps and pulsing highlights.
- **Session Rehydration**: Instant restoration of past analyzed documents from local FastAPI storage.
- **Adaptive Space Theme**: Fluid light and dark modes with customizable visual aesthetics.

## Connecting to Backend
The frontend connects to the backend at `http://127.0.0.1:8000` by default.  
To point to a different URL or host, set the `VITE_API_URL` environment variable:

```bash
VITE_API_URL=http://localhost:8000 npm run dev
```

## Available Scripts
- `npm run dev`: Starts Vite local development server.
- `npm run build`: Compiles TypeScript and creates optimized production assets in `dist/`.
- `npm run preview`: Locally previews production build.

Refer to the root [README.md](../README.md) for complete API specifications and system architecture.
