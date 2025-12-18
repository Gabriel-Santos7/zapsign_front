import { Signer } from './signer.model';

export type DocumentStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired';

export interface Document {
  id: number;
  company: number;
  company_name: string;
  name: string;
  open_id: string;
  token: string;
  provider_status: string;
  internal_status: DocumentStatus;
  file_url: string;
  date_limit_to_sign: string | null;
  created_by: number;
  signers: Signer[];
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentRequest {
  name: string;
  url_pdf: string;
  signers: Array<{
    name: string;
    email: string;
  }>;
  date_limit_to_sign?: string;
}

export interface UpdateDocumentRequest {
  name?: string;
  url_pdf?: string;
  signers?: Array<{
    name: string;
    email: string;
  }>;
  date_limit_to_sign?: string;
}

export interface DocumentInsights {
  id: number;
  document: number;
  missing_topics: string[];
  summary: string;
  insights: string[];
  analyzed_at: string;
  model_used: string;
}

export interface DocumentMetrics {
  total_documents: number;
  signed_documents: number;
  pending_documents: number;
  cancelled_documents: number;
  signature_rate: number;
  average_signature_time_hours: number;
  status_breakdown: Record<string, number>;
  documents_by_month: Record<string, number>;
}

export interface DocumentAlert {
  id?: number;
  type: string;
  message: string;
  document_id: number;
  document_name: string;
  severity: 'info' | 'warning' | 'error';
}

export interface DocumentAlertsResponse {
  alerts: DocumentAlert[];
  count: number;
}
