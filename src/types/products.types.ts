import { ModifierType } from './modifiers.types';

export interface Variant {
  barcode: null | string;
  price: number;
  created_at: string;
  default_price: number;
  default_pricing_type: string;
  deleted_at: null | string;
  item_id: string;
  option1_value: null | string;
  option2_value: null | string;
  option3_value: null | string;
  purchase_cost: null | number;
  reference_variant_id: null | string;
  sku: string;
  stores: Store[];
  updated_at: string;
}

export interface Store {
  available_for_sale: boolean;
  low_stock: null | number;
  optimal_stock: null | number;
  price: number;
  pricing_type: string;
  store_id: string;
}

export interface ProductType {
  key: React.Key;
  _id: string;
  name: string;
  proteins: string[];
  image_url: string;
  description: string;
  is_available: boolean;
  dietary_restrictions: string[];
  stock_status: string;
  category_id: string;
  group_id: string;
  variants: Variant[];
  price: number;
  cost: number;
  modifier_ids: string[];
  modifiers_info: ModifierType[];
  category_name: string;
  track_inventory: boolean;
  in_stock: number;
  low_stock: number;
}
