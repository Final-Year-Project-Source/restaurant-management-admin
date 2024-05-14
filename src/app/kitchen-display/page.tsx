'use client';
import SearchInput from '@/components/adminPage/SearchInput';
import DateRangePicker from '@/components/dateRangePicker';
import Dropdown from '@/components/dropdown/Dropdown';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { updateURLPages } from '@/redux/features/pageSlice';
import { updateQueryParams } from '@/redux/features/queryParamsSlice';
import { useGetGroupsQuery, useGetOrdersQuery } from '@/redux/services/kds';
import { RootState } from '@/redux/store';
import { getSelectedItems, serializeFilters } from '@/utils/commonUtils';
import { convertGroupsToOptions, HEADER_LAYOUT, KDS_STATUSES, PADDING_BLOCK_CONTENT_LAYOUT } from '@/utils/constants';
import { debounce } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Ticket from '../../components/adminPage/Ticket';
import './kds.scss';
import { SkeletonTicket } from '@/components/skeleton/skeletonTicket';
import { useSession } from 'next-auth/react';

const startDate = (() => {
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
const endDate = endDateDefault;
const KitchenDisplay = () => {
  const searchParams = useSearchParams();
  const audioRef = useRef(null);
  const { height, isMobile } = useWindowDimensions();
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const access_token = session?.user?.access_token || '';

  const { data: allGroups, isFetching: isFetchingGroups } = useGetGroupsQuery();
  const Groups = allGroups?.data;
  const GROUPS = convertGroupsToOptions(Groups);
  const DEFAULT_GROUPS_VALUE = GROUPS.map((group) => group.value);
  const DEFAULT_ORDERS_VALUE = KDS_STATUSES.map((order) => order.value);

  const searchUrl = searchParams.get('search') || '';
  let orderUrl = searchParams.get('order_status')?.split(',') || [];
  let groupsUrl = searchParams?.get('group_filter')?.split(',') || [];
  const startTimeParam = searchParams.get('start_time') || '';
  const endTimeParam = searchParams.get('end_time') || '';

  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([startDate, endDate]);
  const allKdsTicketsRef = useRef<HTMLDivElement | null>(null);
  const queryParams = useSelector((state: RootState) => state.queryParams['kitchen-display']);
  const headerKDSElement = isMobile
    ? document.getElementsByClassName('kds-header-mobile')[0]
    : document.getElementsByClassName('kds-header')[0];
  const maxHeightTicket =
    height - (HEADER_LAYOUT + PADDING_BLOCK_CONTENT_LAYOUT + headerKDSElement?.clientHeight + (isMobile ? 0 : 25));
  const {
    data: allOrders,
    isLoading,
    isFetching,
  } = useGetOrdersQuery(
    {
      search: queryParams?.search || '',
      group_filter: queryParams?.groups || [],
      order_statuses: queryParams?.orders || '',
      start_time: queryParams?.startTime || '',
      end_time: queryParams?.endTime || '',
      access_token: access_token,
    },
    { pollingInterval: 5000 },
  );
  const [orders, setOrders] = useState<any[]>([]);
  const orderIds = useRef<any[]>([]);
  let countFetching = useRef(0);

  useEffect(() => {
    if (allOrders?.data) {
      setOrders(allOrders?.data);
    }
    const newOrderIds: string[] = allOrders?.data?.map((order: any) => order._id) || [];
    const addedOrderIds = newOrderIds?.filter((id) => !orderIds?.current?.includes(id));

    if (addedOrderIds.length > 0 && countFetching.current > 0) {
      const audio = audioRef.current as any;
      audio.play();
      // setTimeout(() => {
      //   if (allKdsTicketsRef.current) allKdsTicketsRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      // }, 800);
    }
    countFetching.current++;
    addedOrderIds.forEach((id) => orderIds.current.push(id));
  }, [allOrders?.data]);

  useEffect(() => {
    countFetching.current = 0;
  }, [queryParams?.search, queryParams?.orders, queryParams?.groups, queryParams?.endTime, queryParams?.startTime]);

  useEffect(() => {
    let URL = '/kitchen-display?';
    if (
      !queryParams?.search &&
      !queryParams?.orders?.length &&
      !queryParams?.groups?.length &&
      !queryParams?.endTime &&
      !queryParams?.startTime
    ) {
      URL += serializeFilters({
        search: '',
        orderStatus: DEFAULT_ORDERS_VALUE,
        groups: DEFAULT_GROUPS_VALUE,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      });
    } else {
      URL += serializeFilters({
        search: queryParams?.search || '',
        orderStatus: queryParams?.orders || [],
        groups: queryParams?.groups || [],
        endTime: queryParams?.endTime || '',
        startTime: queryParams?.startTime || '',
      });
    }

    router.push(URL);
  }, [
    queryParams?.search,
    queryParams?.orders,
    queryParams?.groups,
    queryParams?.endTime,
    queryParams?.startTime,
    isFetchingGroups,
  ]);

  useEffect(() => {
    if (searchParams) {
      setIsOpenSearch(!!queryParams?.search);
      setDateRange([new Date(startTimeParam || startDate), new Date(endTimeParam || endDate)]);
      if (DEFAULT_GROUPS_VALUE?.length) {
        groupsUrl =
          (searchParams?.get('group_filter')?.split(',') || [])?.length > 0
            ? (searchParams?.get('group_filter')?.split(',') || []).filter((value) =>
                DEFAULT_GROUPS_VALUE.includes(value),
              )
            : [];
      }

      if (DEFAULT_ORDERS_VALUE?.length) {
        orderUrl =
          (searchParams?.get('order_status')?.split(',') || [])?.length > 0
            ? (searchParams?.get('order_status')?.split(',') || []).filter((value) =>
                DEFAULT_ORDERS_VALUE.includes(value),
              )
            : [];
      }

      dispatch(
        updateQueryParams({
          key: 'kitchen-display',
          value: {
            ...queryParams,
            search: searchUrl || '',
            orders: orderUrl,
            groups: groupsUrl,
            endTime: endTimeParam,
            startTime: startTimeParam,
          },
        }),
      );

      dispatch(updateURLPages({ 'kitchen-display': `/kitchen-display?${searchParams}` }));
    }
  }, [searchParams]);

  const handleUpdateParamsToURL = (values: { [key: string]: any }) => {
    dispatch(updateQueryParams({ key: 'kitchen-display', value: values }));
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

  const debouncedHandleSearch = debounce((value: string) => {
    handleUpdateParamsToURL({ search: value.trim() });
  }, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedHandleSearch(e.target?.value);
  };

  return (
    <>
      <div className={`kds-header mb-[25px]`}>
        <div className="list-filter-1">
          <div className={`statuses-filter group-item-filter`}>
            <Dropdown
              id="group_id"
              mode="multiple"
              className={` white-bg-color  `}
              options={GROUPS}
              labelItem={getSelectedItems(queryParams?.groups || DEFAULT_GROUPS_VALUE, GROUPS, 'All groups')}
              labelAll="All groups"
              isLoading={isFetchingGroups}
              onChange={(value) => handleUpdateParamsToURL({ groups: value })}
              value={queryParams?.groups}
            />
          </div>
          <div className={`statuses-filter statuses-item-filter w-[199px] `}>
            <Dropdown
              id="order_id"
              className={` white-bg-color  `}
              labelItem={getSelectedItems(queryParams?.orders || DEFAULT_ORDERS_VALUE, KDS_STATUSES, 'All statuses')}
              mode="multiple"
              labelAll="All statuses"
              options={KDS_STATUSES}
              onChange={(value) => handleUpdateParamsToURL({ orders: value })}
              value={queryParams?.orders}
            />
          </div>
        </div>
        <div className="list-filter-2">
          <div className={`date-range-filter z-20`}>
            <DateRangePicker dateRange={dateRange} onChange={handleChangeDateRangePicker} />
          </div>
          <div className={`${isOpenSearch ? 'w-full' : 'w-[30px]'} ml-5 flex justify-end`}>
            <SearchInput
              className={`search-animation white-bg-search-input ${isOpenSearch ? 'active' : ''}`}
              placeholder=""
              isOpenSearch={isOpenSearch}
              onChange={handleSearch}
              defaultValue={searchUrl || ''}
              height={38}
              toggleSearch={() => setIsOpenSearch((prev) => !prev)}
            />
          </div>
        </div>
      </div>
      <div className={`kds-header-mobile mb-[25px]`}>
        <div className="list-filter-2">
          <div className={`statuses-filter group-item-filter`}>
            <Dropdown
              id="group_id"
              mode="multiple"
              className={` white-bg-color  `}
              options={GROUPS}
              labelItem={getSelectedItems(queryParams?.groups || DEFAULT_GROUPS_VALUE, GROUPS, 'All groups')}
              labelAll="All groups"
              isLoading={isFetchingGroups}
              onChange={(value) => handleUpdateParamsToURL({ groups: value })}
              value={queryParams?.groups}
            />
          </div>
          <div className={`${isOpenSearch ? 'w-full' : 'w-[30px]'} ml-5 flex justify-end`}>
            <SearchInput
              className={`search-animation white-bg-search-input ${isOpenSearch ? 'active' : ''}`}
              placeholder=""
              isOpenSearch={isOpenSearch}
              onChange={handleSearch}
              defaultValue={searchUrl}
              height={38}
              toggleSearch={() => setIsOpenSearch((prev) => !prev)}
            />
          </div>
        </div>
        <div className="list-filter-1">
          <div className={`date-range-filter z-20`}>
            <DateRangePicker dateRange={dateRange} onChange={handleChangeDateRangePicker} />
          </div>
          <div className={`statuses-filter statuses-item-filter w-[199px] `}>
            <Dropdown
              id="order_id"
              className={` white-bg-color  `}
              labelItem={getSelectedItems(queryParams?.orders || DEFAULT_ORDERS_VALUE, KDS_STATUSES, 'All statuses')}
              mode="multiple"
              labelAll="All statuses"
              options={KDS_STATUSES}
              onChange={(value) => handleUpdateParamsToURL({ orders: value })}
              value={queryParams?.orders}
            />
          </div>
        </div>
      </div>
      {isLoading ? (
        <div
          className={`all-kds-tickets flex flex-row space-x-[20px] w-full h-fit overflow-x-scroll  ${
            isMobile ? 'px-[20px] snap-mandatory snap-x' : 'px-1'
          }`}
          style={{ minHeight: maxHeightTicket }}
        >
          {[...Array(6)].map((_, index) => (
            <SkeletonTicket key={index} />
          ))}
        </div>
      ) : (
        <div
          ref={allKdsTicketsRef}
          style={{ height: maxHeightTicket }}
          className={`all-kds-tickets flex flex-row space-x-[20px] w-full h-fit overflow-x-auto ${
            isMobile ? 'px-[20px] snap-mandatory snap-x' : 'px-1'
          }`}
        >
          {orders?.map((order: any) => {
            return <Ticket key={order._id} order={order} />;
          })}
        </div>
      )}
      <audio ref={audioRef}>
        <source src="/assets/sounds/bell.mp3" type="audio/mpeg" />
      </audio>
    </>
  );
};

export default KitchenDisplay;
