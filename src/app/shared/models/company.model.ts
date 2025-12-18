export interface Company {
  id: number;
  name: string;
  provider: number;
  provider_name: string;
  provider_code: string;
  api_token: string;
  provider_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
