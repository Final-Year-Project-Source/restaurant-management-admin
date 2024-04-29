export interface DiningTableType {
  key: React.Key;
  _id: string;
  name: string;
  location: string;
  qr_code: string;
  discount: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  isAvailable: boolean;
  value: number;
  discount_type: string;
  discount_has_expiration: boolean;
  discount_expiration_date: Date;
  discount_is_limited: boolean;
  discount_max_usage_limit: number;
}
