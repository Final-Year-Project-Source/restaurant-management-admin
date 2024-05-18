export interface OrderItemType {
  created_at: string;
  dietary_requests: object[];
  is_deleted: boolean;
  modifiers: object[];
  product: string;
  quantity: number;
  id: string;
  name: string;
  total: number;
  price: number;
  status: string;
}

export interface TaxInvoiceInfo {
  order_id: string;
  company: string;
  head_office: string;
  address: string;
  createdAt: string;
  is_deleted: boolean;
  tax_id: number;
  price: number;
  updatedAt: string;
  total: number;
  vat_charge: number;
  __v: number;
  _id: string;
}

export interface ReceiptInfo {
  total_taxes: {
    rate: number;
    money_amount: number;
  }[];
  total_discount: number;
  total_money: number;
  total_tax: number;
  line_items: {
    name: string;
    gross_total_money: number;
    quantity: number;
  }[];
}

export interface FeedbackInfo {
  comment: string;
  createdAt: string;
  is_deleted: boolean;
  order_id: string;
  stars: number;
  updatedAt: string;
  contact_phone: string;
  contact_email: string;
  __v: number;
  _id: string;
}

export interface DiscountInfo {
  key: React.Key;
  id: string;
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
}
export interface OrderType {
  key: React.Key;
  id: string;
  dining_table: string;
  dining_table_id: string;
  customer_name: string;
  total: number;
  total_discount: number;
  receipt_number: string;
  receipt_refund_number: string;
  status: string;
  feedback_info: FeedbackInfo;
  staff_id: string;
  orderItems: OrderItemType[];
  orders: any;
  items: OrderItemType[];
  table: string;
  createdAt: string;
  updatedAt: string;
  vat_charge: number;
  service_charge: number;
  sub_total: number;
  payment_id: string;
  is_deleted: boolean;
  tax_invoice_info: TaxInvoiceInfo;
  receipt_info: ReceiptInfo;
  taxes_info: object;
  receipt_refund_info: object;
  change_table_history: {
    old_table_info: {
      name: string;
      location: string;
      discount_info: DiscountInfo;
    };
    time: Date;
    isPaid: Boolean;
    old_total: Number;
    discount_info: DiscountInfo;
  };
  discount_info: DiscountInfo;
}
