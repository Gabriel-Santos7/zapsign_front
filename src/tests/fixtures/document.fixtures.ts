import { Document, DocumentInsights, DocumentMetrics, DocumentAlert } from '../../app/shared/models/document.model';
import { Signer } from '../../app/shared/models/signer.model';
import { Company } from '../../app/shared/models/company.model';

export const mockCompany: Company = {
  id: 1,
  name: 'Test Company',
  provider: 1,
  provider_name: 'ZapSign',
  provider_code: 'zapsign',
  api_token: 'test-api-token-123',
  provider_config: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockSigner: Signer = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  status: 'pending',
  token: 'signer-token-123',
  sign_url: 'https://example.com/sign/123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockSignerSigned: Signer = {
  ...mockSigner,
  id: 2,
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  status: 'signed',
  token: 'signer-token-456',
};

export const mockDocument: Document = {
  id: 1,
  company: 1,
  company_name: 'Test Company',
  name: 'Test Document',
  open_id: 'open-id-123',
  token: 'doc-token-123',
  provider_status: 'pending',
  internal_status: 'pending',
  file_url: 'https://example.com/document.pdf',
  date_limit_to_sign: null,
  created_by: 1,
  signers: [mockSigner],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockDocumentCompleted: Document = {
  ...mockDocument,
  id: 2,
  name: 'Completed Document',
  provider_status: 'signed',
  internal_status: 'completed',
  signers: [mockSignerSigned],
};

export const mockDocumentInsights: DocumentInsights = {
  id: 1,
  document: 1,
  summary: 'Este documento contém informações importantes sobre contratos.',
  missing_topics: ['assinatura digital', 'prazo de validade'],
  insights: [
    'O documento está bem estruturado',
    'Faltam informações sobre prazo de validade',
  ],
  analyzed_at: '2024-01-01T12:00:00Z',
  model_used: 'gpt-4',
};

export const mockDocumentMetrics: DocumentMetrics = {
  total_documents: 100,
  signed_documents: 75,
  pending_documents: 15,
  cancelled_documents: 10,
  signature_rate: 0.75,
  average_signature_time_hours: 24.5,
  status_breakdown: {
    pending: 15,
    in_progress: 10,
    completed: 75,
    cancelled: 10,
  },
  documents_by_month: {
    '2024-01': 30,
    '2024-02': 35,
    '2024-03': 35,
  },
};

export const mockDocumentAlert: DocumentAlert = {
  id: 1,
  document_id: 1,
  document_name: 'Test Document',
  type: 'expiring_soon',
  severity: 'warning',
  message: 'Este documento expira em breve',
};

export const mockDocumentAlerts: DocumentAlert[] = [
  mockDocumentAlert,
  {
    ...mockDocumentAlert,
    id: 2,
    document_id: 2,
    type: 'unsigned',
    severity: 'error',
    message: 'Documento não assinado há mais de 30 dias',
  },
];

