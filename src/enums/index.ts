export enum USER_ROLE {
  ADMINISTRATOR = 'Administrator',
  STANDARD = 'Standard',
  MANAGER = 'Manager',
}

export enum OPERATOR {
  ADD = '+',
  SUB = '-',
  EQUAL = '=',
}

export enum DISCOUNT_TYPE {
  FIXED_PERCENT = 'FIXED_PERCENT',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum PAYMENT_TYPE {
  EDC = 'EDC',
  BEAM = 'BEAM',
}

export enum RECEIPT_TYPE {
  REFUND = 'REFUND',
  SALE = 'SALE',
}

export enum COOKING_STATUS {
  PREPARING = 'Preparing',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum STOCK_STATUSES {
  IN_STOCK = 'In stock',
  LOW_STOCK = 'Low stock',
  OUT_OF_STOCK = 'Out of stock',
}
