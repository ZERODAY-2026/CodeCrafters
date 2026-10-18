import { apiClient } from './client';
import type {
  IngestResultResponse,
  ParsedDocument,
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
 * Performs OCR/parsing with PyMuPDF/RapidOCR.
 * Handles both direct IngestResponse (ParsedDocument) and nested IngestResultResponse formats.
 * Endpoint: POST /api/documents/ingest
 */
export async function ingestDocument(
  file: File
): Promise<ParsedDocument | IngestResultResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.postFormData<ParsedDocument | IngestResultResponse>(
    'api/documents/ingest',
    formData
  );
}

/**
 * Retrieves past ingested document history from the backend.
 * Primary Endpoint: GET /api/documents/history
 */
export async function getDocumentsHistory(): Promise<DocumentHistoryItem[]> {
  try {
    const history = await apiClient.get<DocumentHistoryItem[]>('api/documents/history');
    return history.map((item) => ({
      ...item,
      chat_title: item.chat_title || item.document_id,
    }));
  } catch {
    try {
      const sessions = await apiClient.get<SessionItem[]>('api/sessions');
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
    } catch {
      return [];
    }
  }
}

/**
 * Retrieves the list of all saved sessions.
 */
export async function getSessions(): Promise<SessionItem[]> {
  try {
    return await apiClient.get<SessionItem[]>('api/sessions');
  } catch {
    const history = await getDocumentsHistory();
    return history.map((h) => ({
      chat_title: h.chat_title || h.document_id,
      filename: h.filename,
      created_at: h.timestamp,
    }));
  }
}

/**
 * Fetches an individual parsed document by document ID.
 * Endpoint: GET /api/documents/{document_id}
 */
export async function getDocumentById(documentId: string): Promise<ParsedDocument> {
  return apiClient.get<ParsedDocument>(`api/documents/${encodeURIComponent(documentId)}`);
}

/**
 * Rehydrates a complete session or document by ID/title.
 * Handles both /api/sessions/{id} and /api/documents/{id}.
 */
export async function getSessionDetail(chatTitleOrDocId: string): Promise<SessionDetail> {
  try {
    return await apiClient.get<SessionDetail>(
      `api/sessions/${encodeURIComponent(chatTitleOrDocId)}`
    );
  } catch {
    const doc = await getDocumentById(chatTitleOrDocId);
    const pageSummaries = (doc.pages || []).map((p) => {
      const clean = (p.text || '').trim().replace(/\s+/g, ' ');
      const snippet = clean.slice(0, 220);
      return {
        page: p.page_number,
        summary: snippet
          ? `${snippet}${clean.length > 220 ? '...' : ''}`
          : `Page ${p.page_number} content (${p.char_count || 0} characters).`,
      };
    });
    const totalChars = (doc.pages || []).reduce((acc, p) => acc + (p.char_count || 0), 0);

    return {
      chat_title: doc.document_id,
      parsed: doc,
      result: {
        chat_title: doc.document_id,
        document_id: doc.document_id,
        filename: doc.filename,
        created_at: new Date().toISOString(),
        document_summary: {
          overall_summary: `Loaded **${doc.filename}** (${doc.total_pages} pages, ${totalChars.toLocaleString()} characters).`,
          page_summaries: pageSummaries,
        },
        history: [],
      },
    };
  }
}

/**
 * Submits a question about a document or session, querying the backend.
 * Tries /api/sessions/{id}/query first, then falls back to /api/documents/query.
 */
export async function querySession(
  chatTitleOrDocId: string,
  query: string
): Promise<QueryTurnResponse> {
  try {
    return await apiClient.post<QueryTurnResponse>(
      `api/sessions/${encodeURIComponent(chatTitleOrDocId)}/query`,
      { query }
    );
  } catch {
    const res = await apiClient.post<QueryResponse>('api/documents/query', {
      document_id: chatTitleOrDocId,
      query,
    });
    return {
      query_id: res.query_id || `q-${Date.now()}`,
      timestamp: res.timestamp || new Date().toISOString(),
      question: query,
      answer: res.answer,
      citations: res.citations || [],
    };
  }
}

/**
 * Direct query document helper: calls /api/documents/query.
 */
export async function queryDocument(
  documentId: string,
  query: string
): Promise<QueryResponse> {
  try {
    return await apiClient.post<QueryResponse>('api/documents/query', {
      document_id: documentId,
      query,
    });
  } catch {
    const turn = await querySession(documentId, query);
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
}
