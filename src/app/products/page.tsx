'use client';
import Dropdown from '@/components/dropdown/Dropdown';
import CustomizedSwitch from '@/components/switch';
import Table from '@/components/table/Table';
import Tag from '@/components/tag/tag';
import { updateURLPages } from '@/redux/features/pageSlice';
import { updateQueryParams } from '@/redux/features/queryParamsSlice';
import { useGetCategoriesQuery } from '@/redux/services/categoryApi';
import { useGetGroupsQuery } from '@/redux/services/groupApi';
import {
  useGetProductsQuery,
  useGetQuantityInStockQuery,
  useUpdateProductStatusMutation,
} from '@/redux/services/productApi';
import { RootState } from '@/redux/store';
import { CategoryType } from '@/types/categories.types';
import { GroupType } from '@/types/groups.types';
import { ProductType } from '@/types/products.types';
import {
  convertDataURL,
  formatPrice,
  getSelectedItems,
  queryParamValuesToURL,
  serializeFilters,
} from '@/utils/commonUtils';
import {
  convertCategoriesToOptions,
  convertGroupsToOptions,
  convertStocksToOptions,
  LOW_STOCK,
  OUT_OF_STOCK,
  PAGINATIONLIMIT,
} from '@/utils/constants';
import { ColumnsType } from 'antd/es/table/interface';
import { debounce } from 'lodash';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './product.scss';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import ProductImage from '@/components/ProductImage';
import Image from 'next/image';
import { toast } from 'react-toastify';

const Product = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isOpenSearchInput, setIsOpenSearchInput] = useState(false);
  const { data: session } = useSession();
  const { isMobile } = useWindowDimensions();
  const [updateProductStatus, { isLoading: isStatusLoading }] = useUpdateProductStatusMutation();
  const { data: Categories, isFetching: isFetchingCategories } = useGetCategoriesQuery();
  const { data: Groups, isFetching: isFetchingGroups } = useGetGroupsQuery();
  const { data: quantityInStock, isFetching: isFetchingSocks } = useGetQuantityInStockQuery({
    quantity_in_stock: true,
  });

  const CATEGORIES = convertCategoriesToOptions(Categories);
  const GROUPS = convertGroupsToOptions(Groups);
  const STOCKS = convertStocksToOptions(quantityInStock?.data);

  const DEFAULT_CATEGORIES_VALUE = CATEGORIES.map((category) => category.value);
  const DEFAULT_GROUPS_VALUE = GROUPS.map((group) => group.value);
  const DEFAULT_STOCKS_VALUE = STOCKS.map((stock) => stock.value);

  const queryParams = useSelector((state: RootState) => state.queryParams.products);

  const { data: filteredProductsData, isFetching } = useGetProductsQuery({
    is_be: true,
    page: queryParams?.page || 1,
    limit: queryParams?.limit || 10,
    search: encodeURIComponent(queryParams?.search || ''),
    category_filter: queryParamValuesToURL(queryParams?.categories, 'category_filter') || '',
    group_filter: queryParamValuesToURL(queryParams?.groups, 'group_filter') || '',
    stock_filter: queryParamValuesToURL(queryParams?.stocks, 'stock_filter') || '',
  });
  const Products = filteredProductsData?.data || [];

  let categoriesUrl = convertDataURL(searchParams, DEFAULT_CATEGORIES_VALUE, 'category_filter');
  let groupsUrl = convertDataURL(searchParams, DEFAULT_GROUPS_VALUE, 'group_filter');
  let stocksUrl = convertDataURL(searchParams, DEFAULT_STOCKS_VALUE, 'stock_filter');
  let searchUrl = decodeURIComponent(searchParams.get('search') || '');
  const page = parseInt(searchParams.get('page') || '1');
  let limitUrl = PAGINATIONLIMIT.includes(parseInt(searchParams.get('limit') || '10'))
    ? parseInt(searchParams.get('limit') || '') || 10
    : 10;
  console.log({ CATEGORIES, categoriesUrl });

  const totalPages = filteredProductsData?.totalPages;
  const pageUrl = useMemo(() => (page > 0 ? page : 1), [page]);

  const handleUpdateParamsToURL = (values: { [key: string]: any }) => {
    dispatch(updateQueryParams({ key: 'products', value: values }));
  };

  useEffect(() => {
    let URL = '/products?';
    if (!queryParams?.visited) {
      URL += serializeFilters({
        categories: DEFAULT_CATEGORIES_VALUE || [],
        stocks: DEFAULT_STOCKS_VALUE || [],
        groups: DEFAULT_GROUPS_VALUE || [],
        page: 1,
        limit: 10,
      });
    } else {
      URL += serializeFilters({
        search: queryParams?.search || '',
        categories: queryParams?.categories || [],
        stocks: queryParams?.stocks || [],
        groups: queryParams?.groups || [],
        page: queryParams?.page || 1,
        limit: queryParams?.limit || 10,
      });
    }

    router.push(URL);
  }, [
    queryParams?.stocks,
    queryParams?.categories,
    queryParams?.groups,
    queryParams?.page,
    queryParams?.limit,
    queryParams?.search,
    isFetchingCategories,
    isFetchingGroups,
    isFetchingSocks,
  ]);

  useEffect(() => {
    if (categoriesUrl.length || stocksUrl.length || groupsUrl.length) {
      setIsOpenSearchInput(!!queryParams?.search);

      if (DEFAULT_CATEGORIES_VALUE?.length) {
        categoriesUrl = categoriesUrl?.length > 0 ? categoriesUrl : [];
      }

      if (DEFAULT_GROUPS_VALUE?.length) {
        groupsUrl = groupsUrl?.length > 0 ? groupsUrl : [];
      }

      if (DEFAULT_STOCKS_VALUE?.length) {
        stocksUrl = stocksUrl?.length > 0 ? stocksUrl : [];
      }

      dispatch(
        updateQueryParams({
          key: 'products',
          value: {
            ...queryParams,
            visited: true,
            search: searchUrl || '',
            categories: categoriesUrl,
            groups: groupsUrl,
            stocks: stocksUrl,
            page: pageUrl,
            limit: limitUrl,
          },
        }),
      );

      dispatch(updateURLPages({ products: `/products?${searchParams}` }));
    }
  }, [isFetchingCategories, isFetchingGroups, isFetchingSocks, searchParams]);

  const getCategoryNameById = useCallback(
    (categoryId: string | undefined) => {
      const foundCategory = Categories?.find((category: CategoryType) => category.id === categoryId);
      return foundCategory ? foundCategory.name : null;
    },
    [Categories],
  );

  const getGroupNameById = useCallback(
    (groupId: string | undefined) => {
      const foundGroup = Groups?.find((group: GroupType) => group.id === groupId);
      return foundGroup ? foundGroup.name : null;
    },
    [Groups],
  );

  const handleChangeStatus = (record: ProductType) => {
    updateProductStatus({
      id: record?.id,
      data: { is_available: !record?.is_available },
      access_token: session?.user.access_token || '',
    })
      .unwrap()
      .then()
      .catch((error) => toast.error(error?.data?.message));
  };

  const columns: ColumnsType<ProductType> = [
    {
      title: '',
      dataIndex: 'image_url',
      width: 68,
      render: (_, record) => {
        const isAvailable = record?.is_available;
        const isLowStock = record?.stock_status === LOW_STOCK;
        return (
          record?.image_url && (
            <Image
              className={`image-customized ${!isAvailable ? 'opacity' : ''}`}
              width={48}
              height={43}
              src={record?.image_url}
              alt={record?.name}
            />
          )
        );
      },
    },
    {
      title: 'Product name',
      dataIndex: 'name',
      render: (_, record) => {
        const isLowStock = record?.stock_status === LOW_STOCK;
        const isAvailable = record?.is_available;
        return (
          <div className={`flex items-center space-x-4 ${!isAvailable ? 'text-black-250' : ''}`}>
            <span className={`${isAvailable ? '' : '!text-black-250'} ${isLowStock ? 'text-red-200' : ''}`}>
              {record?.name}
            </span>
            {isLowStock && (
              <div className="min-h-[17px] min-w-[65px]">
                <Tag
                  // className={`!absolute ${isMobile ? `bottom-[26px]` : `bottom-[16.5px]`} `}
                  variant="warning"
                  text={record?.stock_status}
                />{' '}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      responsive: ['sm'],
      render: (_, record) => {
        const isLowStock = record?.stock_status === LOW_STOCK;
        const isAvailable = record?.is_available;
        return (
          <span className={`${isAvailable ? '' : '!text-black-250'} ${isLowStock ? 'text-red-200' : ''}`}>
            {formatPrice(record?.price)}
          </span>
        );
      },
    },
    {
      title: 'Menu category',
      dataIndex: 'category_id',
      responsive: ['sm'],
      render: (_, record) => {
        const isLowStock = record?.stock_status === LOW_STOCK;
        const isAvailable = record?.is_available;
        return (
          <span className={`${isAvailable ? '' : '!text-black-250'} ${isLowStock ? 'text-red-200' : ''}`}>
            {getCategoryNameById(record?.category_id)}
          </span>
        );
      },
    },
    {
      title: 'Group',
      dataIndex: 'group_id',
      responsive: ['sm'],
      render: (_, record) => {
        const isLowStock = record?.stock_status === LOW_STOCK;
        const isAvailable = record?.is_available;

        return (
          <span className={`${isAvailable ? '' : '!text-black-250'} ${isLowStock ? 'text-red-200' : ''}`}>
            {getGroupNameById(record?.group_id)}
          </span>
        );
      },
    },

    {
      title: 'Available',
      dataIndex: 'is_available',
      render: (_, record) => {
        const isOutOfStock = record?.stock_status === OUT_OF_STOCK;

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <CustomizedSwitch
              checked={record?.is_available}
              disabled={isOutOfStock}
              onChange={() => handleChangeStatus(record)}
            />
          </div>
        );
      },
    },
  ];

  const RenderFilterComponent = (
    <div className="dropdown-list w-full flex item-center justify-between">
      <div className="dropdown-item min-w-[250px]">
        <Dropdown
          id="category_id"
          mode="multiple"
          options={CATEGORIES}
          labelAll="All menu categories"
          isLoading={isFetchingCategories}
          value={queryParams?.categories}
          labelItem={getSelectedItems(
            queryParams?.categories || DEFAULT_CATEGORIES_VALUE,
            CATEGORIES,
            'All menu categories',
          )}
          onChange={(value) => {
            handleUpdateParamsToURL({ categories: value, page: 1, limit: 10 });
          }}
        />
      </div>
      <div className="dropdown-item min-w-[199px]">
        <Dropdown
          id="group_id"
          mode="multiple"
          options={GROUPS}
          labelItem={getSelectedItems(queryParams?.groups || DEFAULT_GROUPS_VALUE, GROUPS, 'All groups')}
          labelAll="All groups"
          isLoading={isFetchingGroups}
          onChange={(value) => handleUpdateParamsToURL({ groups: value, page: 1, limit: 10 })}
          value={queryParams?.groups}
        />
      </div>
      <div className="dropdown-item min-w-[199px]">
        <Dropdown
          id="stock_id"
          mode="multiple"
          loading={isFetchingSocks}
          options={STOCKS}
          labelItem={getSelectedItems(queryParams?.stocks || DEFAULT_STOCKS_VALUE, STOCKS, 'All stocks')}
          labelAll="All stocks"
          isLoading={isFetchingCategories}
          onChange={(value) => handleUpdateParamsToURL({ stocks: value, page: 1, limit: 10 })}
          value={queryParams?.stocks}
        />
      </div>
    </div>
  );

  const debouncedHandleSearch = debounce((value: string) => {
    handleUpdateParamsToURL({ search: value.trim(), page: 1, limit: 10 });
  }, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedHandleSearch(e.target?.value);
  };

  const handleRowClick = (record: any) => {
    if (session?.user?.role === 'Standard') return;
    router.push(`products/edit?id=${record?.id}`);
  };

  return (
    <Table
      className="product-customized"
      title="New product"
      columns={columns}
      dataSource={Products}
      isOpenSearchInput={isOpenSearchInput}
      setIsOpenSearch={() => setIsOpenSearchInput((prev) => !prev)}
      onAdd={session?.user?.role !== 'Standard' ? () => router.push('products/add') : undefined}
      isLoading={isFetching || isStatusLoading}
      onSearch={handleSearch}
      cursorPointerOnRow={session?.user?.role !== 'Standard'}
      onRowClick={handleRowClick}
      defaultSearchValue={searchUrl || ''}
      page={pageUrl || 1}
      rowPerPage={limitUrl || 10}
      totalPage={totalPages}
      routerLink="/products"
      keyPage="products"
    >
      {RenderFilterComponent}
    </Table>
  );
};

export default Product;
