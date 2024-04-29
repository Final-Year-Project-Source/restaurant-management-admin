export interface DiscountType {
  key: React.Key;
  _id: string;
  type: string;
  name: string;
  value: number;
  is_limited: boolean;
  max_usage_limit: number;
  has_expiration: boolean;
  expiration_date: string;
  show_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  is_available: boolean;
}
