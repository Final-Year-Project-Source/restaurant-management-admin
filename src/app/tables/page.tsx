'use client';
import Table from '@/components/table/Table';
import Tag from '@/components/tag/tag';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { updateURLPages } from '@/redux/features/pageSlice';
import { updateQueryParams } from '@/redux/features/queryParamsSlice';
import { useGetDiscountsQuery } from '@/redux/services/discountApi';
import { useGetDiningTablesWithPaginationQuery } from '@/redux/services/tableApi';
import { RootState } from '@/redux/store';
import { DiningTableType } from '@/types/tables.types';
import { serializeFilters } from '@/utils/commonUtils';
import { PAGINATIONLIMIT } from '@/utils/constants';
import { ColumnsType } from 'antd/es/table';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './table.scss';

export default function DiningTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, width } = useWindowDimensions();
  const dispatch = useDispatch();

  const queryParams = useSelector((state: RootState) => state.queryParams.tables);

  const { data: allDiningTables, isFetching } = useGetDiningTablesWithPaginationQuery({
    page: queryParams?.page || 1,
    limit: queryParams?.limit || 10,
  });
  const { data: discountsRes, isFetching: isFetchingDiscount } = useGetDiscountsQuery();
  const discountsList = discountsRes?.data;

  const page = parseInt(searchParams.get('page') || '1');
  const limitUrl = PAGINATIONLIMIT.includes(parseInt(searchParams.get('limit') || ''))
    ? parseInt(searchParams.get('limit') || '')
    : 10;
  const totalPage = useMemo(() => {
    const total = allDiningTables?.totalRow;
    if (!isNaN(total)) {
      return Math.ceil(total / limitUrl);
    }
  }, [allDiningTables, limitUrl]);
  const pageUrl = useMemo(() => (page > 0 ? page : 1), [page]);

  useEffect(() => {
    let URL = '/tables?';

    URL += serializeFilters({
      page: queryParams?.page || 1,
      limit: queryParams?.limit || 10,
    });

    router.push(URL);
  }, [queryParams?.page, queryParams?.limit]);

  useEffect(() => {
    if (searchParams) {
      dispatch(
        updateQueryParams({
          key: 'tables',
          value: {
            ...queryParams,
            page: pageUrl,
            limit: limitUrl,
          },
        }),
      );

      dispatch(updateURLPages({ tables: `/tables?${searchParams}` }));
    }
  }, [searchParams]);
  const getDiscountById = useCallback(
    (discountId: string | undefined) => {
      const foundDiscount = discountsList?.find((discount: any) => discount._id === discountId);
      return foundDiscount || null;
    },
    [discountsList],
  );

  const columns: ColumnsType<DiningTableType> = [
    {
      title: 'Tên bàn',
      width: isMobile ? 100 : 160,
      dataIndex: 'name',
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      width: isMobile ? 100 : 160,
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discount',
      width: isMobile ? 200 : 300,
      ellipsis: false,
      render: (_, record) => (
        <div
          className={`flex flex-wrap items-center m-[-3px] ${
            (record.discount_has_expiration && new Date(record.discount_expiration_date) < new Date()) ||
            (record.discount_is_limited && record.discount_max_usage_limit < 1)
              ? 'opacity-50'
              : ''
          }`}
        >
          <p className="m-[3px] max-w-[180px] leading-[18px] truncate ...">
            {' '}
            {record.discount_type === 'FIXED_PERCENT'
              ? `${record.discount} (${record.value}%)`
              : record.discount_type === 'FIXED_AMOUNT'
                ? `${record.discount} (฿${record.value})`
                : '-'}
          </p>
          {((record.discount_has_expiration && new Date(record.discount_expiration_date) < new Date()) ||
            (record.discount_is_limited && record.discount_max_usage_limit < 1)) && (
            <Tag text="Expired" variant="disable" className="m-[3px]" />
          )}
        </div>
      ),
    },
  ];

  // const debouncedHandleSearch = debounce((value: string) => {
  //   setSearchValue(value);
  // }, 500);

  // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   debouncedHandleSearch(e.target.value);
  // };

  const data = allDiningTables?.data.map((table: DiningTableType, index: number) => ({
    key: index,
    _id: table._id,
    name: table.name,
    location: table.location,
    qr_code: table.qr_code,
    discount: getDiscountById(table?.discount)?.name,
    isAvailable: table.isAvailable,
    value: getDiscountById(table?.discount)?.value,
    discount_type: getDiscountById(table?.discount)?.type,
    discount_has_expiration: getDiscountById(table?.discount)?.has_expiration,
    discount_expiration_date: getDiscountById(table?.discount)?.expiration_date,
    discount_is_limited: getDiscountById(table?.discount)?.is_limited,
    discount_max_usage_limit: getDiscountById(table?.discount)?.max_usage_limit,
  }));

  // const filteredTables = useMemo(() => {
  //   return data?.filter((discount: DiningTableType) => {
  //     const nameMatch = discount?.name?.toLowerCase().includes(searchValue.toLowerCase());
  //     const locationMatch = discount?.location?.toLowerCase().includes(searchValue.toLowerCase());

  //     return nameMatch || locationMatch;
  //   });
  // }, [data, searchValue]);

  const handleRowClick = (record: any) => {
    router.push(`tables/edit?id=${record?._id}`);
  };
  return (
    <div className={`bg-white rounded-2xl ${isMobile ? `w-full` : `w-fit`}`}>
      <Table
        title="Tạo bàn ăn"
        columns={columns}
        dataSource={data}
        onAdd={() => router.push(`tables/add`)}
        isLoading={isFetching || isFetchingDiscount}
        onRowClick={handleRowClick}
        cursorPointerOnRow
        maxWidth={isMobile ? width : 633}
        page={pageUrl || 1}
        rowPerPage={limitUrl || 10}
        totalPage={totalPage}
        routerLink="/tables"
        keyPage="tables"
      />
    </div>
  );
}
