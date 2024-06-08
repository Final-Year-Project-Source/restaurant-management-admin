'use client';
import { CountButton } from '@/components/button';
import CustomizedDrawer from '@/components/drawer';
import CustomizedModal from '@/components/modal';
import ProductImage from '@/components/productImage';
import Tag from '@/components/tag/tag';
import { DISCOUNT_TYPE, OPERATOR } from '@/enums';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { updateBasket } from '@/redux/features/basketSlice';
import { useChangeItemQuantityMutation } from '@/redux/services/billApi';
import { formatPrice } from '@/utils/commonUtils';
import { open_sans } from '@/utils/fontUtils';
import { Skeleton } from 'antd';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

interface ItemsProps {
  name: string;
  price: number;
  image_url: string;
  discount?: any;
  className?: string;
  quantity: number;
  priceAfterDiscount?: number;
  note?: string;
  onCountButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  modifiers?: {
    id: string;
    name: string;
    price: number;
    position: number;
  }[];
  isNewItem?: boolean;
  item?: any;
  dietary_restrictions?: string[];
  isEmptyBasket?: boolean;
  disabled?: boolean;
  orderStatus?: string;
  lineThrough?: Boolean;
  isChangeItemQuantity?: boolean;
  bill_id?: string;
  item_id?: string;
  loading?: boolean;
  classModifier?: string;
}

const OrderItem: React.FC<ItemsProps> = ({
  name,
  price,
  priceAfterDiscount,
  image_url,
  discount,
  className,
  note,
  quantity,
  modifiers,
  isNewItem,
  item,
  dietary_restrictions,
  disabled,
  orderStatus,
  lineThrough = false,
  isChangeItemQuantity,
  bill_id,
  item_id,
  loading,
  classModifier = 'text-[11px]',
}) => {
  const [newQuantity, setNewQuantity] = useState<number>(quantity);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { isMobile, width } = useWindowDimensions();
  const { data: session } = useSession();
  const access_token = session?.user?.access_token || '';
  const [changeItemQuantity, { isLoading: isChangingItemQuantity }] = useChangeItemQuantityMutation();
  const handleReduceItemQuantity = async () => {
    const data = {
      bill_id: bill_id,
      item_id,
      quantity: quantity - 1,
    };
    await changeItemQuantity({ data, access_token })
      .unwrap()
      .then((response) => {})
      .catch((error) => toast.error(error?.data?.message));
  };
  useEffect(() => {
    setNewQuantity(quantity);
  }, [quantity]);

  const handleAddItemQuantity = async () => {
    const data = {
      bill_id: bill_id,
      item_id,
      quantity: quantity + 1,
    };
    changeItemQuantity({ data, access_token })
      .unwrap()
      .then((response) => {})
      .catch((error) => toast.error(error?.data?.message));
  };

  const handleDecrement = () => {
    if (newQuantity > 1) {
      if (isChangeItemQuantity) {
        handleReduceItemQuantity();
      } else {
        dispatch(
          updateBasket({
            product: item,
            quantity: 1,
            operator: OPERATOR.SUB,
            dietary_restrictions: dietary_restrictions,
            notes: note,
            modifiers: modifiers,
          }),
        );
      }
    }
    setNewQuantity((prevState) => {
      if (prevState === 1) {
        showModal();
        return prevState;
      }
      return prevState - 1;
    });
  };

  const handleIncrement = () => {
    if (isChangeItemQuantity) {
      handleAddItemQuantity();
    } else {
      dispatch(
        updateBasket({
          product: item,
          quantity: 1,
          operator: OPERATOR.ADD,
          dietary_restrictions: dietary_restrictions,
          notes: note,
          modifiers: modifiers,
        }),
      );
    }
    setNewQuantity((prevState) => {
      return prevState + 1;
    });
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (isChangeItemQuantity) {
      handleReduceItemQuantity();
    } else {
      dispatch(
        updateBasket({
          product: item,
          quantity: 0,
          dietary_restrictions: dietary_restrictions,
          notes: note,
          modifiers: modifiers,
        }),
      );
    }

    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setNewQuantity(1);
    setIsModalOpen(false);
  };

  return (
    <div className={`${className || ''} flex w-full`}>
      {loading ? (
        <div className="flex gap-[20px]">
          <Skeleton.Avatar shape="square" size={86} active />
          <div className="w-full flex flex-col gap-5">
            <Skeleton.Input active size="small" />
            <Skeleton.Button block active size="small" />
          </div>
        </div>
      ) : (
        <>
          <ProductImage className="mr-[24px]" width={86} height={86} src={image_url} alt={name} />

          <div className="flex flex-col w-full">
            <div className="flex space-x-[12px] justify-between  items-center">
              <div className={`text-[14px] text-black-400 ${lineThrough ? 'line-through' : ''}`}>{name}</div>
              {orderStatus && <Tag text={orderStatus} />}
            </div>
            {modifiers && modifiers?.length > 0 && (
              <div className="flex flex-col mt-[7px] text-[11px] text-black-500">
                {modifiers.map((modifier: any, index: number) => (
                  <div key={index} className={`flex items-center justify-between ${open_sans.className}`}>
                    <div className={`${lineThrough ? 'line-through' : ''}`}> Add {modifier.name}</div>
                    {modifier?.price > 0 && (
                      <div>
                        {(discount?.type === DISCOUNT_TYPE.FIXED_PERCENT && (
                          <div className={`flex space-x-[3px]`}>
                            <div> + </div>
                            <div className="line-through">{formatPrice(modifier.price)}</div>
                            <div className={`${classModifier}`}>{formatPrice(modifier.price)}</div>
                          </div>
                        )) || <div className={`text-black-400 ${classModifier}`}>+ {formatPrice(modifier.price)}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {dietary_restrictions && dietary_restrictions?.length > 0 && (
              <div className="flex flex-col mt-[7px] text-[11px] text-black-500">
                {dietary_restrictions.map((dietary: any, index: number) => (
                  <div key={index} className={`flex items-center justify-between ${open_sans.className}`}>
                    {dietary}
                  </div>
                ))}
              </div>
            )}
            {note && (
              <div
                className={`${
                  lineThrough ? 'line-through' : ''
                } flex space-x-[5px] text-[10px] text-black-500 mt-[7px] ${open_sans.className}`}
              >
                <div>Note: {note}</div>
              </div>
            )}

            <div className="flex items-center justify-between mt-[15px]">
              {isNewItem ? (
                <div className="flex space-x-4 items-center w-fit">
                  <CountButton
                    plus={false}
                    disabled={disabled || newQuantity === 0 || isChangingItemQuantity}
                    onClick={handleDecrement}
                  />
                  <span className="font-normal text-base text-center text-black-400 w-4">{newQuantity}</span>
                  <CountButton onClick={handleIncrement} disabled={disabled || isChangingItemQuantity} />
                </div>
              ) : (
                <div className={`flex space-x-[10px] ${lineThrough ? 'line-through' : ''}`}>
                  <div> x {quantity}</div>
                </div>
              )}
              {(discount?.type === DISCOUNT_TYPE.FIXED_PERCENT && (
                <div className="flex space-x-[3px]">
                  <div className={`text-[14px] text-black-400 line-through`}>{formatPrice(price * newQuantity)}</div>
                  <div className="text-[14px] text-black-500">
                    {priceAfterDiscount || formatPrice(price * newQuantity)}
                  </div>
                </div>
              )) || <div className="text-[14px] text-black-400">{formatPrice(price * newQuantity)}</div>}
            </div>

            <CustomizedModal
              open={isModalOpen && !isMobile}
              title="Remove item"
              okText="Remove"
              onOk={handleOk}
              onCancel={handleCancel}
            >
              Are you sure you want to remove the {name?.toLowerCase()} from your basket?
            </CustomizedModal>
            <CustomizedDrawer
              className="bill-drawer"
              type="confirm"
              open={isModalOpen && isMobile}
              onClose={handleCancel}
              title="Confirm removing item"
              okText="Confirm"
              onOk={handleOk}
              width={width}
            >
              <div className="text-center">
                <p> Are you sure you want to remove the {name?.toLowerCase()} from your basket?</p>
              </div>
            </CustomizedDrawer>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderItem;
