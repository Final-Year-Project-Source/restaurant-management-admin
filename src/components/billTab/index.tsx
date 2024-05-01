import { OrderType } from '@/types/orders.types';
import { useCallback, useMemo } from 'react';
import Button from '../adminPage/Button';
import OrderItem from '../user-app-components/orderItem';
import OrderSummary from '../user-app-components/orderSummary';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { Empty, Skeleton } from 'antd';
import SettlementButton from '../SettlementButton';

interface Props {
  paymentStatus?: 'Cancelled' | 'Unpaid' | 'Paid' | 'Refunded';
  disabledEDC?: boolean;
  disabledBeam?: boolean;
  disableEDCRefund?: boolean;
  disabledBeamRefund?: boolean;
  disableTaxInvoice?: boolean;
  disableReceipt?: boolean;
  disabledCancelBill?: boolean;
  billData: OrderType;
  isLoading?: boolean;
  removeItemButton?: boolean;
  isBeamPaymentButtonActive?: boolean;
  isEDCPaymentButtonActive?: boolean;
  isChangeItemQuantity?: boolean;
  onClickEDCPaymentButton?: () => void;
  onClickBeamPaymentButton?: () => void;
  onClickRecordPaymentButton?: () => void;
  onClickCancelBillButton?: () => void;
  onClickEDCRefundButton?: () => void;
  onClickBeamRefundButton?: () => void;
  onClickReceiptButton?: () => void;
  onClickTaxInvoiceButton?: () => void;
  onClickReopenBill?: () => void;
}

const BillTab: React.FC<Props> = ({
  onClickEDCRefundButton,
  onClickTaxInvoiceButton,
  onClickBeamRefundButton,
  onClickReceiptButton,
  paymentStatus,
  isEDCPaymentButtonActive,
  isBeamPaymentButtonActive,
  isChangeItemQuantity,
  onClickCancelBillButton,
  onClickRecordPaymentButton,
  onClickReopenBill,
  isLoading,
  disabledBeam,
  disabledEDC,
  disableEDCRefund,
  disabledBeamRefund,
  disableTaxInvoice,
  disableReceipt,
  disabledCancelBill,
  removeItemButton,
  billData,
  onClickEDCPaymentButton,
  onClickBeamPaymentButton,
}) => {
  // const { data: diningTablesData } = useGetSingleDiningTableQuery({ id: billData.dining_table_id || '' });
  const { isMobile } = useWindowDimensions();
  // const diningTable = diningTablesData?.data;
  // const { data: discountsData } = useGetSingleDiscountQuery(
  //   { id: data?.discount_info. },
  //   { skip: !diningTable?.discount },
  // );
  const discount = billData.discount_info;
  const modifiersTotal = useCallback((orderItems: any) => {
    return orderItems?.modifiers_info?.reduce((accumulator: number, modifier: any) => {
      return accumulator + modifier.price * orderItems.quantity;
    }, 0);
  }, []);

  const subTotal = useMemo(() => {
    let temp = 0;

    if (billData) {
      for (const order of billData.orders) {
        for (const item of order?.items) {
          temp += Number(item.price * item.quantity);
          if (item.modifiers_info) {
            temp += modifiersTotal(item);
          }
        }
      }
    }
    return temp;
  }, [modifiersTotal, billData]);

  const totalDiscount =
    discount && subTotal > 0
      ? discount?.type === 'FIXED_AMOUNT'
        ? discount?.value
        : Math.round(((discount?.value * subTotal) / 100) * 100) / 100
      : 0;
  const subTotalAfterDiscount = Math.round((subTotal - totalDiscount) * 100) / 100;
  const serviceCharge = Math.round(((subTotalAfterDiscount * 10) / 100) * 100) / 100;
  const vat = Math.round(((subTotalAfterDiscount * 7.7) / 100) * 100) / 100;
  const total = Math.round((subTotalAfterDiscount + vat + serviceCharge) * 100) / 100;
  return (
    <div>
      <hr className="w-full border-t border-black-500" />
      <div
        className={`flex space-x-[60px] max-[1024px]:space-x-[0px] max-[1024px]:space-y-[20px] pt-[25px] justify-between max-lg:flex-col`}
      >
        <div className={`w-full flex flex-col space-y-[20px] ${isMobile && `px-[20px]`}`}>
          <label className="font-medium">Tóm tắt đơn</label>
          {isLoading ? (
            <div className={`flex w-full`}>
              <Skeleton.Input active block />
            </div>
          ) : (
            billData?.orders?.length > 0 &&
            billData?.orders?.map((order: any, index: number) => {
              return (
                <div key={index} className="space-y-[20px]">
                  {order?.items.map((item: any, index: number) => {
                    return (
                      <div key={index} className="flex flex-col space-y-5">
                        <OrderItem
                          name={item.product_info?.name}
                          price={item.price / item.quantity}
                          priceAfterDiscount={item?.total_price_product_after_discount}
                          image_url={item.product_info?.image_url}
                          quantity={item.quantity}
                          modifiers={item.modifiers_info}
                          note={item.notes || undefined}
                          dietary_restrictions={item.dietary_requests}
                          isNewItem={!removeItemButton && !(item.status === 'Cancelled')}
                          orderStatus={item.status}
                          isChangeItemQuantity={isChangeItemQuantity}
                          bill_id={billData._id}
                          item_id={item._id}
                          // disabled={!removeItemButton}
                        />
                        <hr className="w-full border-t border-black-100" />
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
          {billData?.orders?.length > 0 ? (
            <OrderSummary
              // className="pb-[50px]"
              discountAmount={billData?.total_discount}
              serviceCharge={serviceCharge}
              vat={vat}
              subTotal={subTotalAfterDiscount}
              total={total}
              discount={discount}
            />
          ) : (
            !isLoading && <Empty description={'Không có món ăn được đặt'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
        {isLoading ? (
          <div className={`flex w-full ${!isMobile && 'mt-10'} `}>
            <Skeleton.Input active block />
          </div>
        ) : (
          <>
            {paymentStatus === 'Unpaid' && (
              <div className={`w-full flex flex-col space-y-[20px]  ${isMobile && `px-[20px] !mb-[25px]`}`}>
                <label className="font-medium">Tuỳ chọn thanh toán</label>
                <div className="h-full flex flex-col space-y-5 justify-between">
                  <div className="flex flex-col space-y-[15px]">
                    <SettlementButton
                      option="EDC"
                      disabled={disabledEDC}
                      isActive={isEDCPaymentButtonActive}
                      onClick={onClickEDCPaymentButton}
                    />

                    <SettlementButton
                      option="Beam"
                      disabled={disabledBeam}
                      isActive={isBeamPaymentButtonActive}
                      onClick={onClickBeamPaymentButton}
                    />
                  </div>

                  <div className="flex flex-col space-y-[10px]">
                    <Button
                      disabled={billData.status === 'Cancelled' || disabledCancelBill}
                      className="min-h-[61px]"
                      onClick={onClickCancelBillButton}
                    >
                      Huỷ hoá đơn
                    </Button>
                    <Button
                      className="min-h-[61px]"
                      variant="secondary"
                      onClick={onClickRecordPaymentButton}
                      disabled={!isEDCPaymentButtonActive && !isBeamPaymentButtonActive}
                    >
                      Ghi lại thanh toán ・ {total}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {paymentStatus === 'Paid' && (
              <div className={`w-full flex flex-col space-y-[20px]  ${isMobile && `px-[20px] !mb-[25px]`}`}>
                <label className="font-medium">Options</label>
                <div className="h-full flex flex-col space-y-5 justify-between">
                  <div className="flex flex-col space-y-[15px]">
                    <SettlementButton
                      option="EDC Refund"
                      disabled={disableEDCRefund}
                      onClick={onClickEDCRefundButton}
                    />

                    <SettlementButton
                      option="Beam Refund"
                      disabled={disabledBeamRefund}
                      onClick={onClickBeamRefundButton}
                    />

                    <SettlementButton option="Receipt" disabled={disableReceipt} onClick={onClickReceiptButton} />

                    <SettlementButton option="Invoice" disabled={disableTaxInvoice} onClick={onClickTaxInvoiceButton} />
                  </div>

                  <div className="flex flex-col space-y-[10px]">
                    <Button
                      className="min-h-[61px]"
                      onClick={onClickReopenBill}
                      disabled={billData.status === 'Cancelled'}
                    >
                      Reopen bill
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {paymentStatus === 'Refunded' && (
              <div className="w-full flex flex-col space-y-[20px] ">
                <label className="font-medium">Options</label>
                <div className="h-full flex flex-col space-y-5 justify-between">
                  <div className="flex flex-col space-y-[15px]">
                    <SettlementButton option="Receipt" disabled={disableReceipt} onClick={onClickReceiptButton} />

                    <SettlementButton option="Invoice" disabled={disableTaxInvoice} onClick={onClickTaxInvoiceButton} />
                  </div>

                  <div className="flex flex-col space-y-[10px]">
                    <Button
                      className="min-h-[61px]"
                      onClick={onClickReopenBill}
                      disabled={billData.status === 'Cancelled'}
                    >
                      Reopen bill
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BillTab;
