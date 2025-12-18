export type SignerStatus =
  | 'pending'
  | 'in_progress'
  | 'signed'
  | 'rejected'
  | 'cancelled';

export interface Signer {
  id: number;
  name: string;
  email: string;
  status: SignerStatus;
  token: string;
  sign_url: string;
  created_at: string;
  updated_at: string;
}

export interface SignerFormData {
  name: string;
  email: string;
}
