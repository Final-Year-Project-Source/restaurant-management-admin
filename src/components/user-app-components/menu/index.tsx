'use client';
import CheckboxGroup from '@/components/checkbox/CheckboxGroup';
import CustomizedDrawer from '@/components/drawer';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { updateDietaryRestrictions, updateProtein } from '@/redux/features/menuFilterSlice';
import { useGetSingleBillQuery } from '@/redux/services/billApi';
import { useGetCategoriesQuery } from '@/redux/services/categoryApi';
import { useGetFilteredProductsQuery } from '@/redux/services/productApi';
import { RootState } from '@/redux/store';
import { ProductType } from '@/types/products.types';
import {
  DESKTOP_FOOTER_HEIGHT,
  DESKTOP_HEADER_HEIGHT,
  DIETARY_RESTRICTIONS_GROUP,
  FOOTER_HEIGHT,
  PADDING_TO_HEADER,
  PROTEINS_GROUP,
  STICKY_HEADER_HEIGHT,
} from '@/utils/constants';
import { ConfigProvider, Drawer, Empty, Skeleton } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MenuLayout from '../layouts/MenuLayout';
import OtherLayout from '../layouts/OtherLayout';
import Product from '../product';
import ProductItem from '../productItem';
import './menu.scss';

interface MenuProps {
  isMobile?: boolean;
  setIsOpenBasket: Dispatch<SetStateAction<boolean>>;
  isOpenMenu: boolean;
  setIsOpenMenu: Dispatch<SetStateAction<boolean>>;
  bill_id: string;
}
const MenuUI: React.FC<MenuProps> = ({ isMobile, setIsOpenBasket, setIsOpenMenu, isOpenMenu, bill_id }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const [height, setHeight] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [selectedItem, setSelectedItem] = useState<ProductType | undefined>(undefined);

  const filterProteinDefault = useSelector(
    (state: RootState) => state.menuFilterReducer.protein,
  ) as CheckboxValueType[];
  const filterDietaryRestrictions = useSelector(
    (state: RootState) => state.menuFilterReducer.dietaryRestrictions,
  ) as CheckboxValueType[];
  const [selectedCheckboxDietaryRestrictionsValues, setSelectedCheckboxDietaryRestrictionsValues] = useState<
    CheckboxValueType[]
  >([]);
  const [selectedCheckboxProteinValues, setSelectedCheckboxProteinValues] = useState<CheckboxValueType[]>([]);

  const { data: allCategories } = useGetCategoriesQuery();

  const { data: filteredProductsData, isFetching } = useGetFilteredProductsQuery({
    search: searchValue,
    dietary_restrictions: selectedCheckboxDietaryRestrictionsValues as any,
    proteins: selectedCheckboxProteinValues as any,
  });

  const Categories = useMemo(() => {
    if (allCategories) {
      return [...allCategories].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return [];
    }
  }, [allCategories]);

  const products = filteredProductsData?.data;

  const organizeProductsByCategory = (products: any[], categories: any[]) => {
    const clonedCategories = Array.isArray(categories) ? [...categories] : [];

    const organizedCategories = clonedCategories
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((category) => {
        const categoryItems = products?.filter((product) => product.category_id === category.id);

        if (categoryItems?.length > 0) {
          const sortedItems = categoryItems.sort((a, b) => a.name.localeCompare(b.name));
          return {
            id: category.id,
            name: category.name,
            items: sortedItems,
          };
        }
        return null;
      })
      .filter(Boolean);

    return organizedCategories;
  };

  const organizedProductsAfterFilter = useMemo(
    () => organizeProductsByCategory(products, Categories),
    [products, Categories],
  );

  const [activeCategory, setActiveCategory] = useState<string>(Categories?.[0]?.id);
  const [isClickedCategoryBtn, setIsClickedClickCategoryBtn] = useState<boolean>(false);
  const allItemInBasket = useSelector((state: RootState) => state.basketReducer.basket) as any;
  const [basketOrderItems, setBasketOrderItems] = useState<any[]>([]);

  const { data: getSingleBill, isFetching: isBillFetching } = useGetSingleBillQuery(
    { id: bill_id || '' },
    { skip: !bill_id },
  );

  const totalItems =
    (basketOrderItems?.length || 0) +
    (getSingleBill?.data?.orders?.reduce((acc: number, order: any) => acc + order.items.length, 0) || 0);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    setBasketOrderItems(allItemInBasket?.orderItems);
  }, [allItemInBasket]);

  const [dietaryRestrictionsSelected, setDietaryRestrictionsSelected] = useState<CheckboxValueType[]>([]);
  const [proteinsSelected, setProteinsSelected] = useState<CheckboxValueType[]>([]);

  useEffect(() => {
    setSelectedCheckboxDietaryRestrictionsValues(filterDietaryRestrictions);
    setSelectedCheckboxProteinValues(filterProteinDefault);
    setDietaryRestrictionsSelected(filterDietaryRestrictions);
    setProteinsSelected(filterProteinDefault);
  }, [filterDietaryRestrictions, filterProteinDefault, open]);

  const showDrawer = () => {
    setOpen(true);
    // setIsOpenMenu(false);
  };
  const onClose = () => {
    setOpen(false);
    // setIsOpenMenu(true);
  };

  const handleCheckboxDietaryRestrictionsChange = (selectedValues: CheckboxValueType[]) => {
    setDietaryRestrictionsSelected(selectedValues);
    // setActiveCategory('');
  };
  const handleCheckboxProteinChange = (selectedValues: CheckboxValueType[]) => {
    setProteinsSelected(selectedValues);
    // setActiveCategory('');
  };

  // const getBadge = () => {
  //   const node = document.createElement('span');
  //   node.classList.add('cart-item-badge');
  //   return node;
  // };

  // const handleCountButtonClick = (e: React.MouseEvent<HTMLButtonElement>, product: any) => {
  //   e.stopPropagation();

  //   const addToBasketBtn = document.getElementById(`btn--add_${product?.id}`);
  //   const { x: xA, y: yA } = addToBasketBtn?.getBoundingClientRect() as any;
  //   const cartItemBadge = getBadge();
  //   addToBasketBtn?.appendChild(cartItemBadge);

  //   const basketElement = document.getElementById('basket-ele');
  //   const { x: xB, y: yB, height: heightBasketElement } = basketElement?.getBoundingClientRect() as any;

  //   cartItemBadge!.style.transform = `translate(${-Math.abs(xA - xB)}px,${
  //     Math.abs(yA - yB) - heightBasketElement / 2
  //   }px)`;

  //   setTimeout(function () {
  //     addToBasketBtn?.removeChild(cartItemBadge);
  //     // update local storage
  //     dispatch(updateBasket({ product, quantity: 1, operator: OPERATOR.ADD }));
  //   }, 1000);
  // };

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (Math.abs(entries.length - Categories.length) <= 1) return;
      entries.forEach((entry) => {
        if (entry.target.id && entry.isIntersecting) {
          setActiveCategory(entry.target.id);
        }
      });
    },
    [Categories],
  );

  const debouncedHandleSearch = debounce((value: string) => {
    setSearchValue(value);
  }, 500);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedHandleSearch(e.target.value);
  };

  useEffect(() => {
    setActiveCategory(organizedProductsAfterFilter?.[0]?.id);
  }, [organizedProductsAfterFilter]);

  useEffect(() => {
    if (isClickedCategoryBtn) return;
    const headerHeight = STICKY_HEADER_HEIGHT + PADDING_TO_HEADER + (!isMobile ? DESKTOP_HEADER_HEIGHT : 0);
    const rootMarginTop = (headerHeight / windowHeight) * 100;
    const rootMarginBottom = 100 - rootMarginTop;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: `-${rootMarginTop}% 0px -${rootMarginBottom}% 0px`,
    });
    const categoryTitle = document.querySelectorAll('.category--item');

    categoryTitle.forEach((category) => {
      observer.observe(category);
    });

    return () => {
      observer.disconnect();
    };
  }, [isClickedCategoryBtn, handleIntersection, filteredProductsData, windowHeight]);

  const btnText = (
    <div>
      <span>View basket</span>
      <span id="basket-ele" className="font-normal">
        ・{totalItems} item
        {totalItems > 1 ? 's' : ''}
      </span>
    </div>
  );

  const body = (
    <main className="flex flex-col justify-center px-[24px] h-full">
      {organizedProductsAfterFilter?.length === 0 && !isFetching && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-black-300 text-lg">No items found</span>}
        />
      )}
      {organizedProductsAfterFilter?.map((category, index) => {
        const length = category?.items?.length || 0;
        return isBillFetching ? (
          <Skeleton avatar paragraph={{ rows: 4 }} />
        ) : (
          <div
            id="last-category"
            key={category?.id}
            className={`flex flex-col justify-start w-full mb-[40px] ${index === 0 ? 'pt-[5px]' : ''}`}
          >
            <p id={category?.id} className="text-[24px] font-medium text-black-500 leading-7 category--item">
              {category?.name}
            </p>
            <div className="flex flex-col w-full mt-[30px]">
              {category?.items?.map((item, index) => (
                <button
                  className={`${item.is_available ? 'cursor-pointer' : 'pointer-events-none'}`}
                  key={item.id}
                  // href={order_id ? `/product?id=${item.id}&order_id=${order_id}` : `/product?id=${item.id}`}
                  onClick={() => {
                    setSelectedItem(item);
                    if (!isMobile) {
                      setIsOpenMenu(false);
                    }
                  }}
                >
                  <div className={index !== 0 ? 'mt-[22px]' : ''}>
                    <ProductItem
                      id={item.id}
                      name={item.name}
                      image_url={item.image_url}
                      description={item.description}
                      price={item.price}
                      // discountPrice={getDiscountedPrice(item.price, discount) || undefined}
                      track_stock={item.is_available}
                    />
                  </div>
                  {index < length - 1 && <hr className="w-full border-t border-black-100 mt-[18px]" />}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <div style={{ height: height }} />
    </main>
  );

  useEffect(() => {
    if (organizedProductsAfterFilter) {
      const categoryElements = document.querySelectorAll('#last-category');
      const lastCategoryElement = categoryElements[categoryElements.length - 1];

      if (lastCategoryElement) {
        const rect = lastCategoryElement.getBoundingClientRect();
        const heightItem = rect.height;
        const marginBottomToItem = 40;
        const deviation = 1;
        const totalHeight =
          windowHeight -
          (STICKY_HEADER_HEIGHT +
            FOOTER_HEIGHT +
            heightItem +
            marginBottomToItem +
            PADDING_TO_HEADER +
            (isMobile ? 0 : DESKTOP_FOOTER_HEIGHT)) +
          deviation;
        deviation;
        setHeight(totalHeight);
      }
    }
  }, [organizedProductsAfterFilter]);

  return (
    <>
      {open && isMobile && (
        <ConfigProvider
          theme={{
            token: {
              fontFamily: 'var(--font-rubik)',
            },
          }}
        >
          <CustomizedDrawer
            classNameFooter="px-5 py-[12px]"
            onOk={() => {
              dispatch(updateDietaryRestrictions(dietaryRestrictionsSelected));
              dispatch(updateProtein(proteinsSelected));
              onClose();
            }}
            onClose={onClose}
            open={open && isMobile}
            okText="Apply filters"
          >
            <OtherLayout isShowBackBtn={true} isShowFooter={true} onClickBackBtn={onClose} title="Filter menu">
              <div className="flex flex-col space-y-[29px] mt-[12px] pl-[25px]">
                <CheckboxGroup
                  defaultValue={filterDietaryRestrictions}
                  {...DIETARY_RESTRICTIONS_GROUP}
                  onChange={handleCheckboxDietaryRestrictionsChange}
                />
                <CheckboxGroup
                  defaultValue={filterProteinDefault}
                  {...PROTEINS_GROUP}
                  onChange={handleCheckboxProteinChange}
                />
              </div>
            </OtherLayout>
          </CustomizedDrawer>
        </ConfigProvider>
      )}
      {selectedItem && (
        <Product
          item={selectedItem}
          discount_info={getSingleBill?.data?.discount_info}
          setSelectedItem={setSelectedItem}
          isMobile={isMobile}
          setIsOpenMenu={setIsOpenMenu}
          setIsOpenBasket={setIsOpenBasket || undefined}
        />
      )}
      {isMobile ? (
        // isOpenMenu && (
        <Drawer
          // classNameFooter="py-[12px] px-5"
          open={isOpenMenu}
          // loading={isBillFetching || isFetching}
          onClose={() => {
            setIsOpenMenu(false);
            router.push(`/bills/${bill_id}`);
          }}
          placement="right"
          closable={false}
          getContainer={false}
          mask={false}
          rootClassName="filter-menu"
          // onOk={() => {
          //   if (setIsOpenBasket) {
          //     setIsOpenBasket(true);
          //   }
          // }}
          // okText={btnText}
        >
          <MenuLayout
            isShowSecondaryButton={true}
            onClickSecondaryBtn={() => {
              if (setIsOpenBasket) {
                setIsOpenBasket(true);
              }
            }}
            onClickBackBtn={() => {
              setIsOpenMenu(false);
              router.push(`/bills/${bill_id}`);
            }}
            secondaryBtnChildren={btnText}
            disabledSecondary={isBillFetching || isFetching}
            toggleFilter={showDrawer}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            isClickedCategoryBtn={isClickedCategoryBtn}
            handleSearch={handleSearch}
            setIsClickedClickCategoryBtn={setIsClickedClickCategoryBtn}
            isEmptyData={!organizedProductsAfterFilter?.length}
            categories={organizedProductsAfterFilter}
            isMobile={isMobile}
            bottomHeight={height}
          >
            {isFetching || isBillFetching ? <LoadingIndicator /> : body}
          </MenuLayout>
        </Drawer>
      ) : (
        !selectedItem && (
          <>
            <div className="relative h-full w-full">
              <MenuLayout
                toggleFilter={showDrawer}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                isClickedCategoryBtn={isClickedCategoryBtn}
                handleSearch={handleSearch}
                setIsClickedClickCategoryBtn={setIsClickedClickCategoryBtn}
                isEmptyData={!organizedProductsAfterFilter?.length}
                disabledSecondary={!totalItems}
                categories={organizedProductsAfterFilter}
                isMobile={isMobile}
                isShowSecondaryButton={true}
              >
                {isFetching || isBillFetching ? <LoadingIndicator /> : body}

                {open && (
                  <Drawer
                    placement="right"
                    closable={false}
                    onClose={onClose}
                    open={open}
                    getContainer={false}
                    mask={false}
                    rootClassName="filter-menu"
                  >
                    <OtherLayout
                      isShowBackBtn={true}
                      isShowSecondaryButton={true}
                      onClickBackBtn={onClose}
                      secondaryBtnChildren="Apply filters"
                      title="Filter menu"
                      onClickSecondaryBtn={() => {
                        dispatch(updateDietaryRestrictions(dietaryRestrictionsSelected));
                        dispatch(updateProtein(proteinsSelected));
                        onClose();
                      }}
                      className="md:mb-3"
                    >
                      <div className="flex flex-col space-y-[29px] mt-[12px] pl-[25px]">
                        <CheckboxGroup
                          defaultValue={filterDietaryRestrictions}
                          {...DIETARY_RESTRICTIONS_GROUP}
                          onChange={handleCheckboxDietaryRestrictionsChange}
                        />
                        <CheckboxGroup
                          defaultValue={filterProteinDefault}
                          {...PROTEINS_GROUP}
                          onChange={handleCheckboxProteinChange}
                        />
                      </div>
                    </OtherLayout>
                  </Drawer>
                )}
              </MenuLayout>
            </div>
          </>
        )
      )}
    </>
  );
};

export default MenuUI;
