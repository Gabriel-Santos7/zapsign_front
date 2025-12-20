import { DocumentStatus } from '../models/document.model';
import { SignerStatus } from '../models/signer.model';
import { environment } from '../../../environments/environment';

export const API_BASE_URL = environment.apiUrl;

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  rejected: 'Rejeitado',
  expired: 'Expirado',
};

export const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'secondary',
  pending: 'warn',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'secondary',
  rejected: 'danger',
  expired: 'danger',
};

export const SIGNER_STATUS_LABELS: Record<SignerStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  signed: 'Assinado',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
};

export const SIGNER_STATUS_COLORS: Record<SignerStatus, string> = {
  pending: 'warn',
  in_progress: 'info',
  signed: 'success',
  rejected: 'danger',
  cancelled: 'secondary',
};
