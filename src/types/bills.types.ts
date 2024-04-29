export interface ItemType {
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
export interface OrderType {
  _id: string;
  placed_ad: string;
  items: ItemType[];
}
export interface BillType {
  key: React.Key;
  _id: string;
  dining_table: string;
  customer_name: string;
  total: number;
  receipt_id: string;
  receipt_refund_id: string;
  status: string;
  feedback_info: FeedbackInfo;
  staff_id: string;
  created_at: string;
  orderItems: OrderType[];
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
  review: number;
  change_table_history: {
    old_table_info: {
      name: string;
      location: string;
      discount_info: {
        type: string;
        discount_percent: number;
        name: string;
        discount_amount: number;
      };
    };
    time: Date;
    isPaid: Boolean;
    old_total: Number;
  };
}
