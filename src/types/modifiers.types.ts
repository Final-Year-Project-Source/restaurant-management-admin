export interface ModifierOption {
  key: number;
  id?: string;
  name: string;
  price: number;
  position?: number;
}

export interface ModifierType {
  key: React.Key;
  id: string;
  name: string;
  position: number;
  stores: string[];
  modifier_options: ModifierOption[];
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
