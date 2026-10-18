export interface PageData {
  page_number: number;
  char_count: number;
  ocr_applied: boolean;
  text: string;
}

export interface ParsedDocument {
  document_id: string;
  filename: string;
  total_pages: number;
  pages: PageData[];
}

// Backward compatibility alias
export type IngestResponse = ParsedDocument;

export interface PageSummary {
  page: number;
  summary: string;
}

export interface DocumentSummary {
  page_summaries: PageSummary[];
  overall_summary: string;
}

export interface Citation {
  page: number;
  quote: string;
}

export interface ChatTurn {
  query_id: string;
  timestamp: string;
  question: string;
  answer: string;
  citations: Citation[];
}

export interface ResultDocument {
  chat_title: string;
  document_id: string;
  filename: string;
  created_at: string;
  document_summary: DocumentSummary;
  history: ChatTurn[];
}

export interface SessionItem {
  chat_title: string;
  filename: string;
  created_at: string;
}

export interface SessionDetail {
  chat_title: string;
  result: ResultDocument;
  parsed: ParsedDocument;
}

export interface IngestResultResponse {
  chat_title: string;
  result: ResultDocument;
  parsed: ParsedDocument;
}

export interface QueryRequest {
  query?: string;
  question?: string;
  document_id?: string;
}

export interface QueryTurnResponse {
  query_id: string;
  timestamp: string;
  question: string;
  answer: string;
  citations: Citation[];
}

// Backward-compatible query response
export interface QueryResponse {
  answer: string;
  citations: Citation[];
  query_id?: string;
  timestamp?: string;
  question?: string;
  explicit_terms?: string[];
  potential_concerns?: string[];
  uncertainties?: string[];
  model_ready?: boolean;
}

export interface HealthResponse {
  status: string;
  ocr_engine: string;
  model?: string;
}

export interface DocumentHistoryItem {
  document_id: string;
  filename: string;
  total_pages: number;
  digital_pages: number;
  ocr_pages: number;
  timestamp: string;
  total_chars: number;
  chat_title?: string;
}
