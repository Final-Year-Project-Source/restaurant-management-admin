'use client';
import { SortArrows } from '@/components/adminPage/SortIcons';
import DateRangePicker from '@/components/dateRangePicker';
import Dropdown from '@/components/dropdown/Dropdown';
import { DownOutlinedIcon, UpOutlinedIcon } from '@/components/Icons';
import ProductImage from '@/components/ProductImage';
import Table from '@/components/table/Table';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { updateURLPages } from '@/redux/features/pageSlice';
import { updateQueryParams } from '@/redux/features/queryParamsSlice';
import { useGetCategoriesQuery } from '@/redux/services/categoryApi';
import { useGetSalesByItemQuery } from '@/redux/services/summary';
import { RootState } from '@/redux/store';
import { CategoryType } from '@/types/categories.types';
import {
  convertDataURL,
  formatPrice,
  getFormatDate,
  getSelectedItems,
  handleDownloadCSV,
  queryParamValuesToURL,
  serializeFilters,
  validateAndConvertDate,
} from '@/utils/commonUtils';
import { convertCategoriesToOptions, endDateDefault, PAGINATIONLIMIT, startDateDefault } from '@/utils/constants';
import { ColumnsType } from 'antd/es/table/interface';
import { debounce } from 'lodash';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './sales-by-item.scss';

const SaleByItems = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isMobile, width } = useWindowDimensions();
  const { data: Categories, isFetching: isFetchingCategories } = useGetCategoriesQuery();
  const CATEGORIES = convertCategoriesToOptions(Categories);
  const DEFAULT_CATEGORIES_VALUE = CATEGORIES.map((category) => category.value);

  const [isOpenSearchInput, setIsOpenSearchInput] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([startDateDefault, endDateDefault]);

  const queryParams = useSelector((state: RootState) => state.queryParams['sales-by-item']);
  const salesSummaryQueryParams = useSelector((state: RootState) => state.queryParams['sales-summary']);

  const { data: salesByItemData, isFetching } = useGetSalesByItemQuery(
    {
      page: queryParams?.page || 1,
      limit: queryParams?.limit || 10,
      search: encodeURIComponent(queryParams?.search || ''),
      category_filter: queryParamValuesToURL(queryParams?.categories, 'category_filter') || '',
      start_time: queryParams?.startTime || '',
      end_time: queryParams?.endTime || '',
      sort_by_no_sold: queryParams?.sortByNoSold || '',
      sort_by_est_profit: queryParams?.sortByEstProfit || '',
      sort_by_net_sales: queryParams?.sortByNetSales || '',
    },
    { refetchOnMountOrArgChange: true },
  );
  const Products = (salesByItemData?.data || []).map((item: any) => ({
    ...item,
    net_sales: formatPrice(item?.net_sales),
    est_profit: formatPrice(item?.est_profit),
  }));

  let searchParam = decodeURIComponent(searchParams?.get('search') || '');
  let startTimeParam = searchParams?.get('start_time') || '';
  let endTimeParam = searchParams?.get('end_time') || '';
  let page = parseInt(searchParams?.get('page') || '1');
  let sortByNoSold = searchParams?.get('sort_by_no_sold');
  let sortByEstProfit = searchParams?.get('sort_by_est_profit');
  let sortByNetSales = searchParams?.get('sort_by_net_sales');
  let limitUrl = PAGINATIONLIMIT.includes(parseInt(searchParams?.get('limit') || '10'))
    ? parseInt(searchParams?.get('limit') || '') || 10
    : 10;
  const totalPage = useMemo(() => {
    const total = salesByItemData?.totalRow;
    if (!isNaN(total)) {
      return Math.ceil(total / limitUrl);
    }
    return 1;
  }, [salesByItemData?.totalRow, limitUrl]);

  const pageUrl = useMemo(() => (page > 0 ? page : 1), [page]);

  const endDateToString = endDateDefault.toISOString();
  const startDateToString = startDateDefault.toISOString();

  const [startTimeUrl, endTimeUrl] = useMemo(() => {
    const validateStartTime = validateAndConvertDate(startTimeParam, startDateToString);
    const validateEndTime = validateAndConvertDate(endTimeParam, endDateToString);

    const startTime =
      validateStartTime && validateEndTime
        ? Date.parse(validateStartTime) >= Date.parse(validateEndTime)
          ? startDateToString
          : validateStartTime
        : undefined;

    const endTime =
      validateStartTime && validateEndTime
        ? Date.parse(validateEndTime) <= Date.parse(validateStartTime) ||
          Date.parse(validateEndTime) > Date.parse(endDateToString)
          ? endDateToString
          : validateEndTime
        : undefined;

    return [startTime, endTime];
  }, [startTimeParam, endTimeParam]);

  let categoriesUrl = convertDataURL(searchParams, DEFAULT_CATEGORIES_VALUE, 'category_filter');

  useEffect(() => {
    if (isFetchingCategories) return;

    let URL = '/sales-by-item?';
    let salesSummaryURL = '/sales-summary?';

    if (!queryParams?.visited) {
      URL += serializeFilters({
        search: '',
        categories: DEFAULT_CATEGORIES_VALUE || [],
        startTime: queryParams?.startTime || startDateToString,
        endTime: queryParams?.endTime || endDateToString,
        page: 1,
        limit: 10,
        sortByNoSold: '',
        sortByEstProfit: '',
        sortByNetSales: '',
      });
    } else {
      URL += serializeFilters({
        search: queryParams?.search || '',
        categories: queryParams?.categories || [],
        endTime: queryParams?.endTime || '',
        startTime: queryParams?.startTime || '',
        page: queryParams?.page || 1,
        limit: queryParams?.limit || 10,
        sortByNoSold: queryParams?.sortByNoSold,
        sortByEstProfit: queryParams?.sortByEstProfit,
        sortByNetSales: queryParams?.sortByNetSales,
      });

      salesSummaryURL += serializeFilters({
        startHour: salesSummaryQueryParams?.startHourFilter || '0',
        endHour: salesSummaryQueryParams?.endHourFilter || 24,
        endTime: queryParams?.endTime || '',
        startTime: queryParams?.startTime || '',
        page: salesSummaryQueryParams?.page || 1,
        limit: salesSummaryQueryParams?.limit || 10,
      });
    }
    setDateRange([
      new Date(queryParams?.startTime) || startDateDefault,
      new Date(queryParams?.endTime) || endDateDefault,
    ]);

    dispatch(
      updateQueryParams({
        key: 'sales-summary',
        value: {
          ...salesSummaryQueryParams,
          endTime: queryParams?.endTime,
          startTime: queryParams?.startTime,
        },
      }),
    );

    router.push(URL);
    dispatch(updateURLPages({ 'sales-summary': `${salesSummaryURL}` }));
  }, [
    queryParams?.search,
    queryParams?.categories,
    queryParams?.page,
    queryParams?.endTime,
    queryParams?.startTime,
    queryParams?.limit,
    queryParams?.sortByNoSold,
    queryParams?.visited,
    queryParams?.sortByEstProfit,
    queryParams?.sortByNetSales,
    isFetchingCategories,
  ]);

  useEffect(() => {
    if (isFetchingCategories) return;

    if (categoriesUrl?.length) {
      setIsOpenSearchInput(!!queryParams?.search);
      setDateRange([new Date(startTimeUrl || ''), new Date(endTimeUrl || '')]);
      if (DEFAULT_CATEGORIES_VALUE?.length) {
        categoriesUrl = categoriesUrl?.length > 0 ? categoriesUrl : [];
      }
      dispatch(
        updateQueryParams({
          key: 'sales-by-item',
          value: {
            ...queryParams,
            visited: true,
            search: searchParam || '',
            categories: categoriesUrl,
            endTime: endTimeUrl,
            startTime: startTimeUrl,
            page: pageUrl,
            limit: limitUrl,
            sortByNoSold: sortByNoSold || '',
            sortByEstProfit: sortByEstProfit || '',
            sortByNetSales: sortByNetSales || '',
          },
        }),
      );

      dispatch(updateURLPages({ 'sales-by-item': `/sales-by-item?${searchParams}` }));
    }
  }, [searchParams, isFetchingCategories]);

  const getCategoryNameById = useCallback(
    (categoryId: string | undefined) => {
      const foundCategory = Categories?.find((category: CategoryType) => category.id === categoryId);
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
          <Image className={`image-customized`} width={48} height={43} src={record?.image_url} alt={record?.name} />
        );
      },
    },
    {
      title: 'Product name',
      dataIndex: 'name',
      render: (name) => <p>{name}</p>,
    },
    {
      title: 'No. sold',
      dataIndex: 'no_sold',
      width: width > 1350 ? 180 : 120,
      showSorterTooltip: false,
      defaultSortOrder:
        queryParams?.sortByNoSold === 'asc' ? 'ascend' : queryParams?.sortByNoSold === 'desc' ? 'descend' : undefined,
      sortDirections: ['ascend'],
      sorter: (a, b) => {
        return Number(a.no_sold) - Number(b.no_sold);
      },
      sortIcon: ({ sortOrder }) => {
        return <>{SortArrows(sortOrder || '')}</>;
      },
    },
    {
      title: 'Menu category',
      dataIndex: 'category_id',
      responsive: !isMobile ? ['lg'] : ['sm'],
      width: width > 1350 ? 250 : 180,
      render: (_, record) => {
        return <span className={``}>{getCategoryNameById(record?.category_id)}</span>;
      },
    },
    {
      title: 'Net sales',
      dataIndex: 'net_sales',
      showSorterTooltip: false,
      responsive: isMobile ? ['sm'] : undefined,
      width: width > 1350 ? 180 : 120,
      defaultSortOrder:
        queryParams?.sortByNetSales === 'asc'
          ? 'ascend'
          : queryParams?.sortByNetSales === 'desc'
            ? 'descend'
            : undefined,
      sortDirections: ['ascend'],
      sorter: (a, b) => {
        return Number(a.net_sales) - Number(b.net_sales);
      },
      sortIcon: ({ sortOrder }) => <>{SortArrows(sortOrder || '', '73px')}</>,
    },
    {
      title: 'Est. profit',
      dataIndex: 'est_profit',
      showSorterTooltip: false,
      responsive: isMobile ? ['sm'] : undefined,
      width: width > 1350 ? 180 : 120,
      defaultSortOrder:
        queryParams?.sortByEstProfit === 'asc'
          ? 'ascend'
          : queryParams?.sortByEstProfit === 'desc'
            ? 'descend'
            : undefined,
      sortDirections: ['ascend'],
      sorter: (a, b) => {
        return a.est_profit - b.est_profit;
      },
      sortIcon: ({ sortOrder }) => <>{SortArrows(sortOrder || '', '78px')}</>,
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
      <div className="dropdown-item min-w-[249px]">
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
  const OnChangeSorter = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field === 'no_sold') {
      handleUpdateParamsToURL({
        sortByNoSold: sorter.order === 'ascend' ? 'asc' : 'desc',
        sortByEstProfit: '',
        sortByNetSales: '',
      });
    }
    if (sorter.field === 'net_sales') {
      handleUpdateParamsToURL({
        sortByNetSales: sorter.order === 'ascend' ? 'asc' : 'desc',
        sortByEstProfit: '',
        sortByNoSold: '',
      });
    }
    if (sorter.field === 'est_profit') {
      handleUpdateParamsToURL({
        sortByEstProfit: sorter.order === 'ascend' ? 'asc' : 'desc',
        sortByNetSales: '',
        sortByNoSold: '',
      });
    }
  };

  const exportToCSV = () => {
    const exportData = salesByItemData?.allData.map((row: any) => ({
      name: row.name,
      no_sold: row.no_sold,
      category: getCategoryNameById(row.category_id),
      netSales: row.net_sales,
      estProfit: row.est_profit,
    }));
    const columNames = ['Product name', 'No. sold', 'Menu Category', 'Net Sales', 'Est. Profit'];
    handleDownloadCSV(
      exportData,
      `${getFormatDate(queryParams?.startTime)}-${getFormatDate(queryParams?.endTime)} Sales By Item Report.csv`,
      columNames,
    );
  };
  return (
    <Table
      className="product-customized"
      title="Export report"
      noPlusOnTitle
      columns={columns}
      dataSource={Products}
      isOpenSearchInput={isOpenSearchInput}
      setIsOpenSearch={() => setIsOpenSearchInput((prev) => !prev)}
      onAdd={exportToCSV}
      isLoading={isFetching}
      onSearch={handleSearch}
      onChangeTable={OnChangeSorter}
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

export default SaleByItems;
