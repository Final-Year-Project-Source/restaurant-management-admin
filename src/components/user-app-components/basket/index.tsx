'use client';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { resetBasket } from '@/redux/features/basketSlice';
import { useGetSingleBillQuery, useUpdateBillMutation } from '@/redux/services/billApi';
import { RootState } from '@/redux/store';
import { formatPrice, getFormattedTime } from '@/utils/commonUtils';
import { Drawer } from 'antd';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import OtherLayout from '../layouts/OtherLayout';
import OrderItem from '../OrderItem';
import OrderSummary from '../OrderSummary';
import './basket.scss';
import { useSession } from 'next-auth/react';
import { CANCELLED } from '@/utils/constants';
import { lowerCase } from 'lodash';

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
  const { data: session } = useSession();
  const { height } = useWindowDimensions();
  const [orders, setOrders] = useState<any[]>([]);

  const [itemsInBasket, setItemsInBasket] = useState<any[]>([]);
  const allItemInBasket = useSelector((state: RootState) => state.basketReducer.basket) as any;
  const [updateBill, { isLoading: isUpdateBillLoading }] = useUpdateBillMutation();
  const { data: singleBill, isLoading } = useGetSingleBillQuery({ id: bill_id || '' }, { skip: !bill_id });
  const discount = singleBill?.data.discount_info;

  useEffect(() => {
    setItemsInBasket(allItemInBasket?.orderItems || []);
    if (bill_id) {
      setOrders(singleBill?.data.orders || []);
    }
  }, [allItemInBasket, allItemInBasket?.orderItems, bill_id, singleBill, isUpdateBillLoading, isLoading]);

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
      for (const order of singleBill?.data?.orders) {
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
        staff_email: session?.user?.email,
        id: bill_id,
        orderItems: itemsInBasket?.map((item) => ({
          ...item,
          product: item.product.id,
          modifiers: item.modifiers.map((modifier: any) => modifier.id),
          dietary_requests: item.dietary_restrictions,
        })),
      };

      updateBill({ data: data })
        .unwrap()
        .then(() => {
          router.push(`/bills/${bill_id}`);
          dispatch(resetBasket());
        })

        .catch((error) => {
          toast.error(error.data.message);
        });
    }
  };

  const btnText = (
    <div className="px-4 py-2 truncate">
      <span>Place order </span> <span className="font-normal">・ {`Total ${formatPrice(total)}`}</span>
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
                    Order placed at {getFormattedTime(new Date(order.placed_at))}
                  </span>
                  {order?.items.map((item: any, index: number) => {
                    return (
                      lowerCase(item?.status) !== CANCELLED && (
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
                            classModifier="text-[10px]"
                            orderStatus={item?.status}
                          />
                          {index !== order?.items?.length - 1 && <hr className="w-full border-t border-black-100" />}
                        </div>
                      )
                    );
                  })}
                </div>
              )
            );
          })}

          {itemsInBasket && itemsInBasket.length > 0 && (
            <span className="text-sm font-medium text-black-400">New additions</span>
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
                classModifier="text-[10px]"
              />
              {index !== itemsInBasket.length - 1 && <hr className="w-full border-t border-black-100" />}
            </div>
          );
        })}

      {(itemsInBasket?.length > 0 || orders?.length > 1 || (orders?.length === 1 && orders?.[0]?.items.length > 0)) && (
        <>
          <hr className="w-full border-t border-black-100" />
          <OrderSummary
            className="pb-[40px]"
            discount={discount}
            discountAmount={totalDiscount}
            serviceCharge={serviceCharge}
            vat={vat}
            subTotal={subTotalAfterDiscount}
            total={total}
          />
        </>
      )}
    </div>
  );

  return isMobile ? (
    <Drawer
      rootClassName="basket-drawer"
      open={isOpenBasket}
      onClose={() => {
        setIsOpenBasket(false);
        setIsOpenMenu(true);
      }}
    >
      <OtherLayout
        isShowFooter={true}
        isMobile={isMobile}
        disabledSecondary={isLoading || isUpdateBillLoading || !(itemsInBasket && itemsInBasket?.length > 0)}
        isShowPrimaryButton={false}
        isShowBackBtn={isMobile ? true : false}
        isShowSecondaryButton={true}
        disabledBackBtn={isLoading || isUpdateBillLoading}
        title="Basket"
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
        {isLoading ? <LoadingIndicator /> : body}
        {isUpdateBillLoading && <LoadingIndicator />}
      </OtherLayout>
    </Drawer>
  ) : (
    <OtherLayout
      isShowFooter={true}
      isShowPrimaryButton={false}
      isShowBackBtn={isMobile ? true : false}
      isShowSecondaryButton={true}
      disabledSecondary={isLoading || isUpdateBillLoading || !(itemsInBasket && itemsInBasket?.length > 0)}
      disabledBackBtn={isLoading || isUpdateBillLoading}
      secondaryBtnChildren={btnText}
      onClickSecondaryBtn={handlePlaceOrder}
      // title="Order basket"
    >
      {isLoading ? <LoadingIndicator /> : body}
      {isUpdateBillLoading && <LoadingIndicator />}
    </OtherLayout>
  );
};

export default Basket;
