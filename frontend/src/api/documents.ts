import { apiClient } from './client';
import type {
  IngestResultResponse,
  SessionItem,
  SessionDetail,
  QueryTurnResponse,
  HealthResponse,
  DocumentHistoryItem,
  QueryResponse,
} from '../types/triage';

/**
 * Checks backend connectivity and returns health and model engine status.
 * Endpoint: GET /api/health
 */
export async function getHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>('api/health');
}

/**
 * Measures round-trip latency and backend connectivity.
 */
export async function checkBackendPing(): Promise<{
  ok: boolean;
  latencyMs: number;
  ocrEngine?: string;
  model?: string;
}> {
  const start = performance.now();
  try {
    const res = await getHealth();
    const elapsed = Math.round(performance.now() - start);
    return {
      ok: res.status === 'ok',
      latencyMs: elapsed,
      ocrEngine: res.ocr_engine,
      model: res.model,
    };
  } catch {
    return { ok: false, latencyMs: 0 };
  }
}

/**
 * Uploads a PDF or TXT file to the backend pipeline.
 * Performs OCR/parsing, runs rolling summarization, and saves session.
 * Endpoint: POST /api/documents/ingest
 */
export async function ingestDocument(file: File): Promise<IngestResultResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.postFormData<IngestResultResponse>('api/documents/ingest', formData);
}

/**
 * Retrieves the list of all saved sessions from the backend default user workspace.
 * Endpoint: GET /api/sessions
 */
export async function getSessions(): Promise<SessionItem[]> {
  return apiClient.get<SessionItem[]>('api/sessions');
}

/**
 * Rehydrates a complete session by chat_title, returning result.json and parsed.json.
 * Endpoint: GET /api/sessions/{chat_title}
 */
export async function getSessionDetail(chatTitle: string): Promise<SessionDetail> {
  return apiClient.get<SessionDetail>(`api/sessions/${encodeURIComponent(chatTitle)}`);
}

/**
 * Submits a question about a session, executes hybrid search QA, persists the turn,
 * and returns the answer with verified citations.
 * Endpoint: POST /api/sessions/{chat_title}/query
 */
export async function querySession(
  chatTitle: string,
  query: string
): Promise<QueryTurnResponse> {
  return apiClient.post<QueryTurnResponse>(
    `api/sessions/${encodeURIComponent(chatTitle)}/query`,
    { query }
  );
}

// =========================================================================
// Backward-Compatibility Helpers
// =========================================================================

/**
 * Backwards-compatible query helper: queries by session title (or documentId).
 */
export async function queryDocument(
  sessionTitleOrDocId: string,
  query: string
): Promise<QueryResponse> {
  const turn = await querySession(sessionTitleOrDocId, query);
  return {
    answer: turn.answer,
    citations: turn.citations,
    query_id: turn.query_id,
    timestamp: turn.timestamp,
    question: turn.question,
    explicit_terms: [],
    potential_concerns: [],
    uncertainties: [],
    model_ready: true,
  };
}

/**
 * Backwards-compatible history fetcher: maps sessions to DocumentHistoryItem.
 */
export async function getDocumentsHistory(): Promise<DocumentHistoryItem[]> {
  const sessions = await getSessions();
  return sessions.map((s) => ({
    document_id: s.chat_title,
    chat_title: s.chat_title,
    filename: s.filename || s.chat_title,
    total_pages: 1,
    digital_pages: 1,
    ocr_pages: 0,
    timestamp: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Recent',
    total_chars: 0,
  }));
}
