'use client';
import InputText from '@/components/adminPage/Input';
import { SortArrows } from '@/components/adminPage/SortIcons';
import DateRangePicker from '@/components/dateRangePicker';
import CustomizedDrawer from '@/components/drawer';
import Dropdown from '@/components/dropdown/Dropdown';
import CustomizedModal from '@/components/modal';
import Stars from '@/components/stars';
import Table from '@/components/table/Table';
import Tag from '@/components/tag/tag';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { updateURLPages } from '@/redux/features/pageSlice';
import { updateQueryParams } from '@/redux/features/queryParamsSlice';
import { useAddBillMutation, useGetBillsQuery } from '@/redux/services/billApi';
import { useGetDiscountsQuery } from '@/redux/services/discountApi';
import { useGetDiningTablesQuery } from '@/redux/services/tableApi';
import { RootState } from '@/redux/store';
import { BillType } from '@/types/bills.types';
import {
  getFormatDateTime,
  getSelectedItems,
  itemsCount,
  serializeFilters,
  validateAndConvertDate,
} from '@/utils/commonUtils';
import {
  DEFAULT_ORDER_STATUSES,
  DEFAULT_PAYMENT_STATUSES,
  PAGINATIONLIMIT,
  BILL_STATUSES,
  endDateDefault,
  startDateDefault,
} from '@/utils/constants';
import { ColumnsType } from 'antd/es/table';
import { useFormik } from 'formik';
import { debounce } from 'lodash';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const schema = Yup.object().shape({
  table_id: Yup.string().required('Missing Table'),
  customer_name: Yup.string().required('Missing Customer Name'),
});

function validateStatus(orderStatus: any, defaultOrderStatus: any) {
  const uniqueOrderStatus = Array.from(new Set(orderStatus));
  return uniqueOrderStatus
    .filter((status) => typeof status === 'string' && defaultOrderStatus.includes(status))
    .map((status) => String(status));
}

const Bills = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isMobile, width } = useWindowDimensions();
  const { data: session } = useSession();
  const access_token = session?.user?.access_token || '';
  const { data: allDiningTables, isLoading: isLoadingTable } = useGetDiningTablesQuery({ access_token });
  const { data: discountsList, isLoading: isLoadingDiscount } = useGetDiscountsQuery();
  const [addBill, { isLoading: isCreateBillLoading }] = useAddBillMutation();
  const [isBillCreating, setIsBillCreating] = useState(false);
  const diningTableList = allDiningTables?.data;

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([startDateDefault, endDateDefault]);
  const [isOpenSearchInput, setIsOpenSearchInput] = useState(false);
  const [isOpenModalNewBill, setIsOpenModalNewBill] = useState(false);
  const [isOpenDrawerNewBill, setIsOpenDrawerNewBill] = useState(false);

  const queryParams = useSelector((state: RootState) => state.queryParams.bills);
  const kdsQueryParams = useSelector((state: RootState) => state.queryParams['kitchen-display']);

  const { data: allBills, isFetching } = useGetBillsQuery(
    {
      access_token: access_token,
      page: queryParams?.page || 1,
      limit: queryParams?.limit || 10,
      search: queryParams?.search || '',
      payment_statuses: queryParams?.paymentStatus?.join(',') || '',
      order_statuses: queryParams?.orderStatus?.join(',') || '',
      start_time: queryParams?.startTime || '',
      end_time: queryParams?.endTime || '',
      sort_by_date: queryParams?.sortByDate || 'desc',
    },
    { refetchOnMountOrArgChange: true },
  );
  const endDateToString = endDateDefault.toISOString();
  const startDateToString = startDateDefault.toISOString();

  //Get Search, Status, Time from URL
  const defaultOrderStatus = DEFAULT_ORDER_STATUSES.split(',')
    .map((status) => status)
    .filter((status) => status.length > 1);
  const defaultPaymentStatus = DEFAULT_PAYMENT_STATUSES.split(',')
    .map((status) => status)
    .filter((status) => status.length > 1);

  let searchParam = searchParams?.get('search') || '';
  let startTimeParam = searchParams?.get('start_time') || '';
  let endTimeParam = searchParams?.get('end_time') || '';
  let page = parseInt(searchParams?.get('page') || '1');
  let sortByDate = searchParams?.get('sort_by_date');
  let limitUrl = PAGINATIONLIMIT.includes(parseInt(searchParams?.get('limit') || '10'))
    ? parseInt(searchParams?.get('limit') || '') || 10
    : 10;

  const pageUrl = useMemo(() => (page > 0 ? page : 1), [page]);

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

  const orderStatusParam = validateStatus(
    (searchParams?.get('order_status') || '')
      .split(',')
      .map((status) => status)
      .filter((status) => status.length > 1),
    defaultOrderStatus,
  );

  const paymentStatusParam = validateStatus(
    (searchParams?.get('payment_status') || '')
      .split(',')
      .map((status) => status)
      .filter((status) => status.length > 1),
    defaultPaymentStatus,
  );

  useEffect(() => {
    let URL = '/bills?';
    let KDS_URL = '/kitchen-display?';
    if (!queryParams?.visited) {
      URL += serializeFilters({
        search: '',
        orderStatus: defaultOrderStatus,
        paymentStatus: defaultPaymentStatus,
        startTime: queryParams?.startTime || startDateToString,
        endTime: queryParams?.endTime || endDateToString,
        page: 1,
        limit: 10,
      });
    } else {
      URL += serializeFilters({
        search: queryParams?.search || '',
        orderStatus: queryParams?.orderStatus || [],
        paymentStatus: queryParams?.paymentStatus || [],
        endTime: queryParams?.endTime || '',
        startTime: queryParams?.startTime || '',
        page: queryParams?.page || 1,
        limit: queryParams?.limit || 10,
      });
      KDS_URL += serializeFilters({
        search: kdsQueryParams?.search || '',
        orderStatus: kdsQueryParams?.orders || [],
        groups: kdsQueryParams?.groups || [],
        endTime: queryParams?.endTime || '',
        startTime: queryParams?.startTime || '',
      });
    }
    setDateRange([
      new Date(queryParams?.startTime) || startDateDefault,
      new Date(queryParams?.endTime) || endDateDefault,
    ]);
    dispatch(
      updateQueryParams({
        key: 'kitchen-display',
        value: {
          ...kdsQueryParams,
          endTime: queryParams?.endTime,
          startTime: queryParams?.startTime,
        },
      }),
    );
    router.push(URL);
    dispatch(updateURLPages({ 'kitchen-display': `${KDS_URL}` }));
  }, [
    queryParams?.search,
    queryParams?.orderStatus,
    queryParams?.paymentStatus,
    queryParams?.page,
    queryParams?.endTime,
    queryParams?.startTime,
    queryParams?.limit,
    queryParams?.sortByDate,
    queryParams?.visited,
  ]);

  useEffect(() => {
    if (orderStatusParam?.length || paymentStatusParam?.length) {
      setIsOpenSearchInput(!!queryParams?.search);
      setDateRange([new Date(startTimeUrl || ''), new Date(endTimeUrl || '')]);

      dispatch(
        updateQueryParams({
          key: 'bills',
          value: {
            ...queryParams,
            visited: true,
            search: searchParam || '',
            orderStatus: orderStatusParam,
            paymentStatus: paymentStatusParam,
            endTime: endTimeUrl,
            startTime: startTimeUrl,
            page: pageUrl,
            limit: limitUrl,
            sortByDate: sortByDate || 'desc',
          },
        }),
      );

      dispatch(updateURLPages({ bills: `/bills?${searchParams}` }));
    }
  }, [searchParams]);

  const handleUpdateParamsToURL = (values: { [key: string]: any }) => {
    dispatch(updateQueryParams({ key: 'bills', value: values }));
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

  const handleRowClick = (record: any) => {
    router.push(`bills/${record?.id}?tab=bill`);
  };

  const handleChangeStatus = (value: any) => {
    if (typeof value[0]?.statuses[0] === 'string') {
      handleUpdateParamsToURL({ orderStatus: value[0]?.statuses, page: 1, limit: 10 });
    } else {
      handleUpdateParamsToURL({ orderStatus: [], page: 1, limit: 10 });
    }
    if (typeof value[1]?.statuses[0] === 'string') {
      handleUpdateParamsToURL({ paymentStatus: value[1]?.statuses, page: 1, limit: 10 });
    } else {
      handleUpdateParamsToURL({ paymentStatus: [], page: 1, limit: 10 });
    }
  };

  const debouncedHandleSearch = debounce((value: string) => {
    handleUpdateParamsToURL({ search: value.trim(), page: 1, limit: 10 });
  }, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedHandleSearch(e.target?.value);
  };

  const renderDiscount = (item: any) => {
    return (
      <div
        className={`grid grid-flow-col auto-cols-auto w-fit ${
          (item.has_expiration && new Date(item.expiration_date) < new Date()) ||
          (item.is_limited && item.max_usage_limit < 1)
            ? 'opacity-50'
            : ''
        }`}
      >
        <p className="mr-[10px] truncate ...">
          {item.type === 'FIXED_PERCENT'
            ? `${item.name} (${item.value}%)`
            : item.type === 'FIXED_AMOUNT'
              ? `${item.name} (${item.value} vnd)`
              : '-'}
        </p>
        {((item.has_expiration && new Date(item.expiration_date) < new Date()) ||
          (item.is_limited && item.max_usage_limit < 1)) && (
          <Tag className="place-self-center" text="Expired" variant="disable" />
        )}
      </div>
    );
  };
  const filterComponent = (
    <>
      <div className={`statuses-filter w-[199px]`}>
        <Dropdown
          id="statuses"
          mode="multiple"
          labelItem={getSelectedItems(
            (queryParams?.orderStatus || BILL_STATUSES[0].statuses).concat(
              queryParams?.paymentStatus || BILL_STATUSES[1].statuses,
            ),
            BILL_STATUSES[0].statuses.concat(BILL_STATUSES[1].statuses),
            'All Statuses',
          )}
          labelAll="Show all statuses"
          options={BILL_STATUSES}
          multipleGroup
          onChange={(value) => handleChangeStatus(value)}
          value={[{ statuses: queryParams?.orderStatus }, { statuses: queryParams?.paymentStatus }] || []}
        />
      </div>
      <div className={`date-range-filter z-20 w-[327px]`}>
        <DateRangePicker dateRange={dateRange} onChange={handleChangeDateRangePicker} />
      </div>
    </>
  );
  const formik = useFormik({
    initialValues: {
      table_id: '',
      customer_name: '',
      discount_id: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setIsBillCreating(true);
      const data = {
        dining_table_id: values.table_id,
        discount_id: values.discount_id,
        customer_name: values.customer_name,
        staff_email: session?.user?.email,
      };
      data.customer_name = data.customer_name.trim();
      addBill({
        data: data,
      })
        .unwrap()
        .then((res) => {
          router.push(`bills/${res?.data?.id}?tab=bill`);
        })
        .catch((error) => {
          toast.error(error.data.message);
          setIsOpenModalNewBill(false);
          setIsOpenDrawerNewBill(false);
          setIsBillCreating(false);
        });
    },
  });
  const OnChangeSorter = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field === 'createdAt') {
      handleUpdateParamsToURL({
        sortByDate: sorter.order === 'ascend' ? 'asc' : 'desc',
      });
    }
  };
  const { errors, touched, values, handleChange, handleSubmit, resetForm, setValues, submitForm } = formik;

  const data = [...(allBills?.data || [])]
    .sort((a: any, b: any) => new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime())
    .map((bill: any, index: number) => ({
      ...bill,
      key: index,
      dining_table: bill.dining_table,
      item_order: `${itemsCount(bill.orders)} items / ${bill.orders.length} orders`,
      name: `${bill.dining_table_info.name} (${bill.dining_table_info.location}) - ${bill.customer_name}`,
      createdAt: getFormatDateTime(bill.created_at),
      review: bill.feedback_info?.stars || 0,
    }));
  const columns: ColumnsType<BillType> = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      width: isMobile ? 90 : 150,
      showSorterTooltip: false,
      defaultSortOrder: queryParams?.sortByDate === 'asc' ? 'ascend' : 'descend',
      sortDirections: ['ascend'],
      sorter: (a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateA - dateB;
      },
      sortIcon: ({ sortOrder }) => <>{SortArrows(sortOrder || '')}</>,
      render: (createdAt) => <p>{createdAt}</p>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: isMobile ? 140 : 180,
      render: (name) => <p>{name}</p>,
    },
    {
      title: 'Order status',
      dataIndex: 'status',
      width: isMobile ? 75 : 130,
    },
    {
      title: 'Payment status',
      dataIndex: 'payment_status',
      width: 140,
      responsive: ['md'],
    },
    {
      title: 'Item / orders',
      dataIndex: 'item_order',
      width: 150,
      responsive: ['md'],
      render: (item_order) => <p>{item_order}</p>,
    },
    {
      title: 'Review',
      dataIndex: 'review',
      width: 170,
      responsive: ['lg'],
      render: (_, record) => (
        <div className="overflow-hidden">
          <Stars value={record.review} size={'small'} disabled />
        </div>
      ),
    },
  ];

  const formNewBill = (
    <form onSubmit={handleSubmit}>
      <div className="space-y-[20px] mb-[30px]">
        <Dropdown
          showSearch
          id="table_id"
          mode="tags"
          height={48}
          placeholder="-"
          label="Table name"
          options={diningTableList?.map((item: any) => ({
            label: `${item.name} (${item.location})`,
            value: item.id,
          }))}
          value={values.table_id}
          onChange={(value) => handleChange({ target: { id: 'table_id', value } })}
        />
        {errors.table_id && touched.table_id && <span className="text-[12px] text-red-500">{errors.table_id}</span>}
        <InputText
          id="customer_name"
          placeholder="Enter name"
          label="Customer Name"
          value={values.customer_name}
          onChange={handleChange}
          allowClear
          height={48}
        />
        {errors.customer_name && touched.customer_name && (
          <span className="text-[12px] text-red-500">{errors.customer_name}</span>
        )}
        <Dropdown
          showSearch
          customFilterOptionsForSearch
          id="discount_id"
          mode="tags"
          height={48}
          placeholder="-"
          label="Discount"
          // options={convertDiscountToOptions(discountsList)}
          options={discountsList?.map((item: any) => ({
            label: renderDiscount(item),
            value: item.id,
            searchLabel: item.name,
          }))}
          value={values.discount_id}
          onChange={(value) => handleChange({ target: { id: 'discount_id', value } })}
        />
      </div>
    </form>
  );

  return (
    <div className="bg-white rounded-2xl">
      <Table
        columns={columns}
        title="New bill"
        onChangeTable={OnChangeSorter}
        dataSource={data}
        isLoading={isFetching || isLoadingDiscount || isLoadingTable}
        cursorPointerOnRow
        onAdd={() => {
          resetForm();
          if (!isMobile) {
            setIsOpenModalNewBill(true);
          } else {
            setIsOpenDrawerNewBill(true);
          }
        }}
        isOpenSearchInput={isOpenSearchInput}
        setIsOpenSearch={() => setIsOpenSearchInput((prev) => !prev)}
        onRowClick={handleRowClick}
        onSearch={handleSearch}
        page={pageUrl || 1}
        rowPerPage={limitUrl || 10}
        totalPage={allBills?.totalPages}
        routerLink="/bills"
        defaultSearchValue={searchParam || ''}
        keyPage="bills"
      >
        {filterComponent}
      </Table>
      <CustomizedModal
        open={isOpenModalNewBill && !isMobile}
        width={388}
        className="m-[10px]"
        onCancel={() => setIsOpenModalNewBill(false)}
        onOk={() => submitForm()}
        okText="Create new bill"
        loading={isFetching}
        title="Create new bill"
        disableOkButton={isCreateBillLoading || isBillCreating}
      >
        {formNewBill}
      </CustomizedModal>
      <CustomizedDrawer
        className="bill-drawer"
        open={isOpenDrawerNewBill && isMobile}
        onClose={() => setIsOpenDrawerNewBill(false)}
        title="Create new bill"
        okText="Create new bill"
        onOk={() => submitForm()}
        width={width}
        disableOkButton={isCreateBillLoading || isBillCreating}
      >
        {formNewBill}
      </CustomizedDrawer>
    </div>
  );
};

export default Bills;
