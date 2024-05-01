'use client';
import TextAreaInput from '@/components/adminPage/TextArea';
import CheckboxGroup from '@/components/checkbox/CheckboxGroup';
import Icon from '@/components/DietaryIcons';
import { OPERATOR } from '@/enums';
import { updateBasket } from '@/redux/features/basketSlice';
import { ProductType } from '@/types/products.types';
import { getDietaryRequests, getDiscountedPrice, getModifiersModifier } from '@/utils/commonUtils';
import { open_sans } from '@/utils/fontUtils';
import { Drawer, Skeleton } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import Image from 'next/image';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import ProductLayout from '../layouts/ProductLayout';
import './skeleton.scss';

interface ProductProps {
  item?: any;
  discount_info?: any;
  setSelectedItem?: Dispatch<SetStateAction<ProductType | undefined>>;
  isMobile?: boolean;
  setIsOpenMenu: Dispatch<SetStateAction<boolean>>;
  setIsOpenBasket: Dispatch<SetStateAction<boolean>>;
}

const Product: React.FC<ProductProps> = ({
  item,
  setSelectedItem,
  isMobile,
  setIsOpenMenu,
  setIsOpenBasket,
  discount_info,
}) => {
  const [notes, setNotes] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [selectedDietaryRequests, setSelectedDietaryRequests] = useState<any[]>([]);

  const [totalAmount, setTotalAmount] = useState<number>(0);

  const discount = discount_info;

  const originalPrice = useMemo(() => (item as any)?.price || 0, [item, discount]);
  const [loadingImage, setLoadingImage] = useState(true);

  const { image_url, name, description, dietary_restrictions, modifier_ids, modifiers_info } = (item as any) || {};
  const dispatch = useDispatch();

  const [modifierState, setModifierState] = useState<{ [groupName: string]: CheckboxValueType[] }>({});

  const handleCheckboxChange = useCallback((selectedValues: CheckboxValueType[], groupName: string) => {
    setModifierState((prevModifierState) => {
      return {
        ...prevModifierState,
        [groupName]: selectedValues,
      };
    });
  }, []);

  const allCheckedOptions = useMemo(() => {
    return modifiers_info?.flatMap((modifierGroup: any) => {
      const groupSelectedValues = modifierState[modifierGroup.name];

      if (groupSelectedValues) {
        return modifierGroup.modifier_options.filter((modifier_option: any) =>
          groupSelectedValues.includes(modifier_option.name),
        );
      }
      return [];
    });
  }, [modifierState, modifiers_info]);

  const totalCheckedOptionsPrice = useMemo(() => {
    return allCheckedOptions?.reduce(
      (accumulator: any, modifier_option: any) => accumulator + (+modifier_option?.price || 0),
      0,
    );
  }, [allCheckedOptions, discount]);

  useEffect(() => {
    setTotalAmount(+originalPrice + +totalCheckedOptionsPrice || 0);
    setSelectedOptions(allCheckedOptions);
  }, [originalPrice, totalCheckedOptionsPrice, allCheckedOptions]);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleAddToBasket = () => {
    const productItem = {
      product: item,
      notes: notes.trim(),
      modifiers: selectedOptions,
      dietary_restrictions: selectedDietaryRequests,
    };

    dispatch(updateBasket({ ...productItem, quantity: 1, operator: OPERATOR.ADD }));
    if (setSelectedItem) {
      setSelectedItem(undefined);
    }
    if (!isMobile) {
      setIsOpenBasket(true);
    }
  };

  const btnText = (
    <div>
      <span>Thêm vào giỏ hàng</span> <span className="font-normal">・ {totalAmount}</span>
    </div>
  );

  const body = (
    <div className="relative h-full">
      <div className="h-[228px]">
        {image_url && (
          <Image
            className="absolute top-[40px] right-1/2 transform translate-x-1/2"
            src={image_url}
            alt="product"
            width={260}
            height={260}
            loading="lazy"
            onLoad={() => setLoadingImage(false)}
            onError={() => setLoadingImage(false)}
          />
        )}
        {loadingImage && (
          <Skeleton.Avatar
            className="absolute top-[24px] right-1/2 transform translate-x-1/2"
            size={273}
            active
            style={{ backgroundColor: '#e5e5e5' }}
          />
        )}
      </div>

      <div className="flex flex-col px-6 pt-[88px] pb-[30px] text-black-500 space-y-[29px]">
        <div className="flex flex-col space-y-[15px]">
          <span className="text-2xl font-medium">{name}</span>
          <span
            className={`text-sm font-normal ${open_sans.className}`}
            dangerouslySetInnerHTML={{ __html: description || '' }}
          />
          <div className="flex space-x-[9px] items-start">
            {Array.isArray(dietary_restrictions) &&
              dietary_restrictions.map((item, index) => <Icon key={index} iconName={item} />)}
          </div>
        </div>
        {modifier_ids?.length > 0 &&
          getModifiersModifier(modifiers_info)?.map((modifier, index) => (
            <CheckboxGroup
              key={index}
              groupName={modifier?.nameGroup ?? ''}
              options={modifier?.options ?? []}
              onChange={handleCheckboxChange}
            />
          ))}
        {getDietaryRequests((item as ProductType)?.dietary_restrictions || [])?.length > 0 && (
          <CheckboxGroup
            groupName="Yêu cầu ăn kiêng"
            options={
              getDietaryRequests((item as ProductType)?.dietary_restrictions || [])?.map((label: any) => ({
                label: 'Làm ' + label,
              })) ?? []
            }
            onChange={(value) => {
              setSelectedDietaryRequests(value);
            }}
          />
        )}
        <div className="flex flex-col space-y-2.5">
          <span className="font-medium text-sm text-black-400">Ghi chú</span>
          <TextAreaInput placeholder="Notes for the kitchen" onChange={handleTextAreaChange} />
        </div>
      </div>
    </div>
  );

  return isMobile ? (
    <Drawer
      rootClassName="product-drawer"
      onClose={() => {
        if (setSelectedItem) {
          setSelectedItem(undefined);
        }
        // setIsOpenMenu(true);
      }}
      open={isMobile}
      // onOk={() => {
      //   handleAddToBasket();
      // }}
      // okText={btnText}
    >
      <ProductLayout
        isShowSecondaryButton={true}
        isShowFooter={true}
        secondaryBtnChildren={btnText}
        onClickSecondaryBtn={handleAddToBasket}
        isMobile
        onClickBackBtn={() => {
          if (setSelectedItem) {
            setSelectedItem(undefined);
          }
          // setIsOpenMenu(true);
        }}
      >
        {body}
      </ProductLayout>
    </Drawer>
  ) : (
    <ProductLayout
      isShowFooter={true}
      secondaryBtnChildren={btnText}
      isShowSecondaryButton={true}
      onClickBackBtn={() => {
        if (setSelectedItem) {
          setSelectedItem(undefined);
        }
        setIsOpenMenu(true);
      }}
      onClickSecondaryBtn={handleAddToBasket}
      className="md:mb-3"
    >
      {body}
    </ProductLayout>
  );
};

export default Product;
