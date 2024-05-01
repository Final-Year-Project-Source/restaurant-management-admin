'use client';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { resetBasket } from '@/redux/features/basketSlice';
import { useGetSingleBillQuery, useUpdateBillMutation } from '@/redux/services/billApi';
import { RootState } from '@/redux/store';
import { getFormattedTime } from '@/utils/commonUtils';
import { Drawer } from 'antd';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import OtherLayout from '../layouts/OtherLayout';
import OrderItem from '../orderItem';
import OrderSummary from '../orderSummary';
import './basket.scss';

interface BasketProps {
  isMobile?: boolean;
  bill_id?: string;
  isOpenBasket: boolean;
  setIsOpenBasket: Dispatch<SetStateAction<boolean>>;
  setIsOpenMenu: Dispatch<SetStateAction<boolean>>;
}

const Basket: React.FC<BasketProps> = ({ isMobile, bill_id, isOpenBasket, setIsOpenBasket, setIsOpenMenu }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { height } = useWindowDimensions();
  const [orders, setOrders] = useState<any[]>([]);

  const [itemsInBasket, setItemsInBasket] = useState<any[]>([]);
  const allItemInBasket = useSelector((state: RootState) => state.basketReducer.basket) as any;
  const [updateBill, { isLoading: isUpdateBillLoading }] = useUpdateBillMutation();
  const { data: singleBill, isFetching } = useGetSingleBillQuery({ id: bill_id || '' }, { skip: !bill_id });
  const discount = singleBill?.data.discount_info;

  useEffect(() => {
    setItemsInBasket(allItemInBasket?.orderItems || []);
    if (bill_id) {
      setOrders(singleBill?.data.orders || []);
    }
  }, [allItemInBasket, allItemInBasket?.orderItems, bill_id, singleBill, isUpdateBillLoading, isFetching]);

  const modifiersTotal = useCallback(
    (orderItems: any) => {
      return orderItems?.modifiers?.reduce((accumulator: any, modifier: any) => {
        return accumulator + modifier?.price * orderItems?.quantity;
      }, 0);
    },
    [discount],
  );

  var subTotal = useMemo(() => {
    let temp = itemsInBasket?.reduce((a: any, b: any) => a + +b?.product?.price * b?.quantity + modifiersTotal(b), 0);
    if (singleBill) {
      for (const order of singleBill?.data.orders) {
        for (const item of order.items) {
          temp += Number(item.price * item.quantity);
          if (item.modifiers_info) {
            for (const modifier of item.modifiers_info) temp += Number(modifier.price * item.quantity);
          }
        }
      }
    }
    return temp;
  }, [itemsInBasket, discount, modifiersTotal, singleBill]);

  const totalDiscount = discount
    ? discount?.type === 'FIXED_AMOUNT'
      ? discount?.value
      : Math.round(((discount?.value * subTotal) / 100) * 100) / 100
    : 0;
  const subTotalAfterDiscount =
    Math.round((subTotal - totalDiscount) * 100) / 100 > 0 ? Math.round((subTotal - totalDiscount) * 100) / 100 : 0;
  const serviceCharge = Math.round(((subTotalAfterDiscount * 10) / 100) * 100) / 100;
  const vat = Math.round(((subTotalAfterDiscount * 7.7) / 100) * 100) / 100;
  const total = Math.round((subTotalAfterDiscount + vat + serviceCharge) * 100) / 100;

  const handlePlaceOrder = () => {
    if (itemsInBasket?.length > 0) {
      const data = {
        id: bill_id,
        orderItems: itemsInBasket?.map((item) => ({
          ...item,
          product: item.product._id,
          modifiers: item.modifiers.map((modifier: any) => modifier._id),
          dietary_requests: item.dietary_restrictions,
        })),
      };

      updateBill({ data: data })
        .unwrap()
        .then(() => {
          dispatch(resetBasket());
        })

        .catch((error) => {
          toast.error(error.data.message);
        });
    }
    router.push(`/bills/${bill_id}`);
  };

  const btnText = (
    <div className="px-4 py-2 truncate">
      <span>Đặt hàng </span> <span className="font-normal">・ {`Tổng ${total}`}</span>
    </div>
  );
  const orderBasketHeight = height - (isMobile ? 170 : 403);

  const body = (
    <div
      className="h-full flex flex-col space-y-5 max-md:px-6 pl-[24px] pr-[26px] max-md:pt-[22px] pt-[18px]"
      style={{ height: orderBasketHeight }}
    >
      {orders?.length > 0 && (
        <>
          {orders.map((order: any, index: number) => {
            return (
              order?.items.length > 0 && (
                <div key={index} className="space-y-[20px]">
                  <span className="text-sm font-medium text-black-400">
                    Đơn hàng được đặt vào lúc {getFormattedTime(new Date(order.placed_at))}
                  </span>
                  {order?.items.map((item: any, index: number) => {
                    return (
                      <div key={index} className="flex flex-col space-y-5">
                        <OrderItem
                          name={item.product_info?.name}
                          price={item.product_info?.price}
                          priceAfterDiscount={item?.total_price_product_after_discount}
                          image_url={item.product_info?.image_url}
                          quantity={item.quantity}
                          modifiers={item.modifiers_info}
                          note={item.notes || undefined}
                          dietary_restrictions={item.dietary_restrictions}
                          loading={isFetching || isUpdateBillLoading}
                          classModifier="text-[10px]"
                        />
                        {index !== order?.products?.length - 1 && <hr className="w-full border-t border-black-100" />}
                      </div>
                    );
                  })}
                </div>
              )
            );
          })}

          {itemsInBasket && itemsInBasket.length > 0 && (
            <span className="text-sm font-medium text-black-400">Bổ sung mới</span>
          )}
        </>
      )}
      {itemsInBasket &&
        itemsInBasket.length > 0 &&
        itemsInBasket?.map((item: any, index: number) => {
          return (
            <div key={index} className="flex flex-col space-y-5">
              <OrderItem
                key={index}
                item={item?.product}
                name={item?.product?.name}
                price={item.product?.price}
                image_url={item?.product?.image_url}
                quantity={item.quantity}
                modifiers={item.modifiers}
                note={item?.notes || undefined}
                isNewItem={true}
                dietary_restrictions={item.dietary_restrictions}
                disabled={isUpdateBillLoading}
                loading={isFetching || isUpdateBillLoading}
                classModifier="text-[10px]"
              />
              <hr className="w-full border-t border-black-100" />
            </div>
          );
        })}

      {(itemsInBasket?.length > 0 || orders?.length > 0) && (
        <OrderSummary
          className="pb-[40px]"
          discount={discount}
          discountAmount={totalDiscount}
          serviceCharge={serviceCharge}
          vat={vat}
          subTotal={subTotalAfterDiscount}
          total={total}
        />
      )}
    </div>
  );

  return isMobile ? (
    <Drawer
      // classNameFooter="py-[12px] px-5"
      rootClassName="basket-drawer"
      open={isOpenBasket}
      onClose={() => {
        setIsOpenBasket(false);
        setIsOpenMenu(true);
      }}
      // onOk={() => {
      //   setIsOpenBasket(false);
      //   handlePlaceOrder();
      // }}
      // okText={btnText}
    >
      <OtherLayout
        isShowFooter={true}
        isMobile={isMobile}
        disabledSecondary={isUpdateBillLoading || isFetching}
        isShowPrimaryButton={false}
        isShowBackBtn={isMobile ? true : false}
        isShowSecondaryButton={true}
        title="Giỏ hàng"
        onClickSecondaryBtn={() => {
          setIsOpenBasket(false);
          handlePlaceOrder();
        }}
        secondaryBtnChildren={btnText}
        onClickBackBtn={() => {
          setIsOpenMenu(true);
          setIsOpenBasket(false);
        }}
      >
        {isFetching ? <LoadingIndicator /> : body}
        {isUpdateBillLoading && <LoadingIndicator />}
      </OtherLayout>
    </Drawer>
  ) : (
    <OtherLayout
      isShowFooter={true}
      isShowPrimaryButton={false}
      isShowBackBtn={isMobile ? true : false}
      isShowSecondaryButton={true}
      disabledSecondary={isUpdateBillLoading || isFetching}
      disabledBackBtn={isUpdateBillLoading || isFetching}
      secondaryBtnChildren={btnText}
      onClickSecondaryBtn={handlePlaceOrder}
      // title="Order basket"
    >
      {isFetching ? <LoadingIndicator /> : body}
      {isUpdateBillLoading && <LoadingIndicator />}
    </OtherLayout>
  );
};

export default Basket;
