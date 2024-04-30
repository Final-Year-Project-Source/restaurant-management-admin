'use client';
import Dropdown from '@/components/dropdown/Dropdown';
import Table from '@/components/table/Table';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { updateURLPages } from '@/redux/features/pageSlice';
import { updateQueryParams } from '@/redux/features/queryParamsSlice';
import { useGetCategoriesQuery } from '@/redux/services/categoryApi';
import { useGetSalesByItemQuery } from '@/redux/services/summary';
import { RootState } from '@/redux/store';
import { CategoryType } from '@/types/categories.types';
import { ProductType } from '@/types/products.types';
import { getFormatDate, getSelectedItems, handleDownloadCSV, serializeFilters } from '@/utils/commonUtils';
import { convertCategoriesToOptions, PAGINATIONLIMIT } from '@/utils/constants';
import { ColumnsType } from 'antd/es/table/interface';
import { debounce } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './sales-by-item.scss';
import ProductImage from '@/components/productImage';
import DateRangePicker from '@/components/dateRangePicker';
import { DownOutlinedIcon, UpOutlinedIcon } from '@/components/Icons';

const startDateDefault = (() => {
  const thisWeekStartDate = new Date();
  thisWeekStartDate.setDate(thisWeekStartDate.getDate() - thisWeekStartDate.getDay() + 1);
  thisWeekStartDate.setHours(0, 0, 0, 0);
  return thisWeekStartDate;
})();

const endDateDefault = (() => {
  const thisDate = new Date();
  thisDate.setHours(23, 59, 59, 59);
  return thisDate;
})();
const SalesByItem = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const { data: allCategories, isFetching: isFetchingCategories } = useGetCategoriesQuery();
  const Categories = allCategories?.data;
  const CATEGORIES = convertCategoriesToOptions(Categories);
  const DEFAULT_CATEGORIES_VALUE = CATEGORIES.map((category) => category.value);

  const [isOpenSearchInput, setIsOpenSearchInput] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([startDateDefault, endDateDefault]);

  const queryParams = useSelector((state: RootState) => state.queryParams['sales-by-item']);

  const { data: salesByItemData, isFetching } = useGetSalesByItemQuery(
    {
      page: queryParams?.page || 1,
      limit: queryParams?.limit || 10,
      search: queryParams?.search || '',
      category_filter: queryParams?.categories || [],
      start_time: queryParams?.startTime || '',
      end_time: queryParams?.endTime || '',
    },
    { refetchOnMountOrArgChange: true },
  );
  const Products = salesByItemData?.data || [];

  let searchParam = searchParams?.get('search') || '';
  let startTimeParam = searchParams?.get('start_time');
  let endTimeParam = searchParams?.get('end_time');
  let page = parseInt(searchParams?.get('page') || '1');
  let limitUrl = PAGINATIONLIMIT.includes(parseInt(searchParams?.get('limit') || '10'))
    ? parseInt(searchParams?.get('limit') || '') || 10
    : 10;
  const totalPage = useMemo(() => {
    const total = salesByItemData?.totalRow;
    if (!isNaN(total)) {
      return Math.ceil(total / limitUrl);
    }
  }, [salesByItemData, limitUrl]);
  const pageUrl = useMemo(() => (page > 0 ? page : 1), [page]);
  let categoriesUrl = searchParams?.get('category_filter')?.split(',') || [];

  useEffect(() => {
    let URL = '/sales-by-item?';
    if (!queryParams?.search && !queryParams?.categories?.length && !queryParams?.endTime && !queryParams?.startTime) {
      URL += serializeFilters({
        search: '',
        categories: DEFAULT_CATEGORIES_VALUE || [],
        startTime: startDateDefault.toISOString(),
        endTime: endDateDefault.toISOString(),
        page: 1,
        limit: 10,
      });
    } else {
      URL += serializeFilters({
        search: queryParams?.search || '',
        categories: queryParams?.categories || [],

        endTime: queryParams?.endTime || '',
        startTime: queryParams?.startTime || '',
        page: queryParams?.page || 1,
        limit: queryParams?.limit || 10,
      });
    }

    router.push(URL);
  }, [
    queryParams?.search,
    queryParams?.categories,
    queryParams?.page,
    queryParams?.endTime,
    queryParams?.startTime,
    queryParams?.limit,
    isFetchingCategories,
  ]);

  useEffect(() => {
    if (searchParams) {
      setIsOpenSearchInput(!!queryParams?.search);
      setDateRange([new Date(startTimeParam || startDateDefault), new Date(endTimeParam || endDateDefault)]);
      dispatch(
        updateQueryParams({
          key: 'sales-by-item',
          value: {
            ...queryParams,
            search: searchParam || '',
            categories: categoriesUrl,
            endTime: endTimeParam,
            startTime: startTimeParam,
            page: pageUrl,
            limit: limitUrl,
          },
        }),
      );

      dispatch(updateURLPages({ 'sales-by-item': `/sales-by-item?${searchParams}` }));
    }
  }, [searchParams, isFetchingCategories]);

  const getCategoryNameById = useCallback(
    (categoryId: string | undefined) => {
      const foundCategory = Categories?.find((category: CategoryType) => category._id === categoryId);
      return foundCategory ? foundCategory.name : null;
    },
    [Categories],
  );

  const columns: ColumnsType<any> = [
    {
      title: '',
      dataIndex: 'image_url',
      width: 70,
      render: (_, record) => {
        return (
          <ProductImage
            className={`image-customized`}
            width={48}
            height={43}
            src={record?.image_url}
            alt={record?.name}
          />
        );
      },
    },
    {
      title: 'Tên món ăn',
      dataIndex: 'name',
      // sorter: (a, b) => a.name.localeCompare(b.name),
      // sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Số lượng đã bán',
      dataIndex: 'no_sold',
      width: width > 1350 ? 180 : 120,
      defaultSortOrder: 'descend',
      sortDirections: ['ascend', 'descend'],
      sorter: (a, b) => a.no_sold - b.no_sold,
      sortIcon: ({ sortOrder }) => (sortOrder === 'descend' ? <DownOutlinedIcon /> : <UpOutlinedIcon />),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_id',
      responsive: ['sm'],
      width: width > 1350 ? 250 : 180,
      render: (_, record) => {
        return <span>{getCategoryNameById(record?.category_id)}</span>;
      },
      sorter: (a, b) => getCategoryNameById(a.category_id).localeCompare(getCategoryNameById(b.category_id)),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Doanh thu',
      dataIndex: 'net_sales',
      responsive: ['sm'],
      width: width > 1350 ? 180 : 120,
      defaultSortOrder: 'descend',
      sortDirections: ['ascend', 'descend'],
      sorter: (a, b) => a.net_sales - b.net_sales,
      sortIcon: ({ sortOrder }) => (sortOrder === 'descend' ? <DownOutlinedIcon /> : <UpOutlinedIcon />),
    },
    {
      title: 'Lợi nhuận',
      dataIndex: 'est_profit',
      responsive: ['sm'],
      width: width > 1350 ? 180 : 120,
      defaultSortOrder: 'descend',
      sortDirections: ['ascend', 'descend'],
      sorter: (a, b) => a.est_profit - b.est_profit,
      sortIcon: ({ sortOrder }) => (sortOrder === 'descend' ? <DownOutlinedIcon /> : <UpOutlinedIcon />),
    },
  ];

  const handleUpdateParamsToURL = (values: { [key: string]: any }) => {
    dispatch(updateQueryParams({ key: 'sales-by-item', value: values }));
  };

  const handleChangeDateRangePicker = (startDate: Date | null, endDate: Date | null) => {
    setDateRange([startDate, endDate]);
    const formattedStartDate = startDate ? startDate.toISOString() : null;
    const formattedEndDate = endDate ? endDate.toISOString() : null;
    if (!!endDate && !!startDate && endDate > startDate) {
      const valuesToUpdate = {
        startTime: formattedStartDate,
        endTime: formattedEndDate,
        page: 1,
        limit: 10,
      };
      handleUpdateParamsToURL(valuesToUpdate);
    }
  };

  const handleChangeCategoriesFilter = (value: any) => {
    handleUpdateParamsToURL({ categories: value, page: 1, limit: 10 });
  };

  const RenderFilterComponent = (
    <div className="dropdown-list-sales-by-item w-full flex item-center max-[1280px]:justify-between">
      <div className={`date-range-filter z-20 w-[327px] min-[1280px]:mr-[20px]`}>
        <DateRangePicker dateRange={dateRange} onChange={handleChangeDateRangePicker} />
      </div>
      <div className="dropdown-item min-w-[209px]">
        <Dropdown
          id="category_id"
          mode="multiple"
          options={CATEGORIES}
          labelAll="Tất cả danh mục"
          isLoading={isFetchingCategories}
          value={queryParams?.categories}
          labelItem={getSelectedItems(
            queryParams?.categories || DEFAULT_CATEGORIES_VALUE,
            CATEGORIES,
            'Tất cả danh mục',
          )}
          onChange={handleChangeCategoriesFilter}
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

  const exportToCSV = () => {
    const exportData = salesByItemData?.allData.map((row: any) => ({
      name: row.name,
      no_sold: row.no_sold,
      category: getCategoryNameById(row.category_id),
      discounts: row.discounts,
      netSales: row.net_sales,
      estProfit: row.est_profit,
    }));
    const columNames = ['Tên món ăn', 'Số lượng đã bán', 'Danh mục', 'Doanh thu', 'Lợi nhuận'];
    handleDownloadCSV(
      exportData,
      `${getFormatDate(queryParams?.startTime)}-${getFormatDate(queryParams?.endTime)} Thống kê mặt hàng.csv`,
      columNames,
    );
  };
  return (
    <Table
      className="product-customized"
      title="Xuất thống kê"
      noPlusOnTitle
      columns={columns}
      dataSource={Products}
      isOpenSearchInput={isOpenSearchInput}
      setIsOpenSearch={() => setIsOpenSearchInput((prev) => !prev)}
      onAdd={exportToCSV}
      isLoading={isFetching}
      onSearch={handleSearch}
      cursorPointerOnRow={false}
      defaultSearchValue={searchParam || ''}
      page={pageUrl || 1}
      rowPerPage={limitUrl || 10}
      totalPage={totalPage}
      routerLink="/sales-by-item"
      keyPage="sales-by-item"
    >
      {RenderFilterComponent}
    </Table>
  );
};

export default SalesByItem;
