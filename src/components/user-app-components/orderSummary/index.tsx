import { formatPrice } from '@/utils/commonUtils';
import { open_sans } from '@/utils/fontUtils';
import { FC } from 'react';

export interface OrderSummaryProps {
  serviceCharge: number;
  vat: number;
  subTotal: number;
  total: number;
  className?: string;
  discountAmount?: number;
  discount?: any;
  totalItems?: number;
}

const OrderSummary: FC<OrderSummaryProps> = ({
  discountAmount,
  serviceCharge,
  vat,
  subTotal,
  total,
  className,
  discount,
  totalItems,
}) => {
  const discount_text = discount
    ? discount?.type === 'FIXED_AMOUNT'
      ? ` ${formatPrice(discount?.value)} vnd`
      : `${discount?.value}%`
    : null;
  return (
    <div className={`${className || ''} flex flex-col space-y-[7px] ml-[108px] text-black-500`}>
      <div className={`text-[10px] font-normal ${open_sans.className}`}>
        {discountAmount! > 0 && (
          <div className="flex items-center justify-between ">
            <span>{discount_text} Discount</span>
            <span>-{formatPrice(discountAmount || 0)}</span>
          </div>
        )}
        <div className="flex items-center justify-between ">
          <span>Subtotal</span>
          <span>{formatPrice(subTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>10% Service Charge</span>
          <span>{formatPrice(serviceCharge)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>7% VAT</span>
          <span>{formatPrice(vat)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm  font-normal">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
};

export default OrderSummary;
