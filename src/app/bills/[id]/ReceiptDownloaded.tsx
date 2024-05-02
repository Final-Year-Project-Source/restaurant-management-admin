'use client';
import { YellowLaneBlackIcon } from '@/components/Icons';
import OrderItem from '@/components/user-app-components/orderItem';
import { open_sans } from '@/utils/fontUtils';
import moment from 'moment';

const ReceiptDownLoadedImage = ({ className, bill }: { className?: string; bill: any }) => {
  const discount = bill?.discount_info;
  const subTotal = bill?.sub_total;
  const totalDiscount = bill?.total_discount || 0;
  const serviceCharge10 = bill?.service_charge;
  const vat7 = bill?.vat_charge;
  let Items = [];
  const discount_text = discount
    ? discount.type === 'FIXED_AMOUNT'
      ? `฿${discount?.value}`
      : `${discount?.value}%`
    : null;
  if (bill?.orders?.length > 0) {
    for (const order of bill?.orders) {
      for (const item of order?.items) {
        Items.push(item);
      }
    }
  }
  return (
    <div className={`${className || ''} px-6 pt-[60px]`} id="receipt">
      <div className="flex items-center flex-col">
        <YellowLaneBlackIcon />
        <span
          className={`text-center leading-normal max-w-[260px] text-black-500 text-[10px] mt-[20.78px] mb-[30px] font-normal ${open_sans.className}`}
        >
          Bella OnoJie. 174 Nguyen Luong Bang, Hoa Khanh bac, Lien Chieu, Da Nang, Viet Nam. Tax ID : 0235563109861.
          Tel: 092 123 8378
        </span>

        <div className="h-[28px] font-medium leading-normal mb-[12px] text-[24px] text-black-500">Receipt</div>

        <div className="h-[17px] leading-normal">
          {moment(bill?.receipt_data?.created_at).format('DD MMMM YYYY, HH:mm')}
        </div>
      </div>

      <div className="flex font-medium text-black-400 mt-[30px]"> Order summary </div>
      {Items?.map((item: any, index: number) => {
        return (
          <div key={index} className="mt-[20px]">
            <OrderItem
              name={item?.product_info?.name}
              price={item?.price}
              priceAfterDiscount={item?.total_price_product_after_discount}
              image_url={item?.image_url}
              quantity={item?.quantity}
              modifiers={item?.modifiers_info}
              note={item?.notes || undefined}
              dietary_restrictions={item?.dietary_requests || []}
            />
            <hr className="w-full border-t border-black-100 mt-[20px]" />
          </div>
        );
      })}

      <div className="mt-[20px] ml-[108px] pb-[60px]">
        <div className={`text-[10px] text-black-500 space-y-[3px] ${open_sans.className}`}>
          {totalDiscount > 0 && (
            <div className="flex items-center justify-between ">
              <span>{discount_text} Discount </span>
              <span>-{totalDiscount}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div> Subtotal </div>
            <div> {subTotal} </div>
          </div>
          <div className="flex items-center justify-between">
            <div> 10% Service Charge </div>
            <div> {serviceCharge10} </div>
          </div>
          <div className="flex items-center justify-between">
            <div> 7% VAT </div>
            <div> {vat7} </div>
          </div>
        </div>
        <div className="text-[14px] flex items-center mt-[7px] justify-between ">
          <div> Total </div>
          <div> {bill?.total} </div>
        </div>
      </div>
    </div>
  );
};
export default ReceiptDownLoadedImage;
