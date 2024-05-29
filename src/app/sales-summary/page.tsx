'use client';
import AreaChart from '@/components/adminPage/AreaChart';
import Button from '@/components/adminPage/Button';
import CardsReport from '@/components/cardsReport';
import DateRangePicker from '@/components/dateRangePicker';
import DropdownHourPeriod from '@/components/dropdown/DropdownHourPeriod';
import Table from '@/components/table/Table';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { updateURLPages } from '@/redux/features/pageSlice';
import { updateQueryParams } from '@/redux/features/queryParamsSlice';
import { useGetSalesSummaryQuery } from '@/redux/services/summary';
import { RootState } from '@/redux/store';
import {
  generateChartData,
  getFormatDate,
  getFormatDateTime,
  handleDownloadCSV,
  formatPrice,
  serializeFilters,
  validateAndConvertDate,
} from '@/utils/commonUtils';
import { endDateDefault, PAGINATIONLIMIT, startDateDefault } from '@/utils/constants';
import { ColumnsType } from 'antd/es/table/interface';
import { isEqual } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './summary.scss';

interface SaleSummaryType {
  key: React.Key;
  time: string;
  grossSales: string;
  refunds: string;
  discounts: string;
  netSales: string;
  estimatedProfit: string;
}

const SalesSummary = () => {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { isMobile, width } = useWindowDimensions();
  const router = useRouter();

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([startDateDefault, endDateDefault]);
  const [valueFIlterByHour, setValueFIlterByHour] = useState('');
  const [hourPeriodLabel, setHourPeriodLabel] = useState('');
  const [typeChart, setTypeChart] = useState('gross sales');
  const queryParams = useSelector((state: RootState) => state.queryParams['sales-summary']);
  const salesByItemQueryParams = useSelector((state: RootState) => state.queryParams['sales-by-item']);
  console.log({ startDateDefault, endDateDefault });

  const { data: salesSummaryData, isLoading: isLoadingData } = useGetSalesSummaryQuery({
    page: queryParams?.page || 1,
    limit: queryParams?.limit || 10,
    start_time: queryParams?.startTime || '',
    end_time: queryParams?.endTime || '',
    end_hour: queryParams?.endHourFilter || 24,
    start_hour: queryParams?.startHourFilter || 0,
  });

  const startTimeParam = searchParams.get('start_time') || '';
  const endTimeParam = searchParams.get('end_time') || '';
  const startHourUrl = parseInt(searchParams.get('start_hour') || '0');
  const endHourUrl = parseInt(searchParams.get('end_hour') || '24');
  const startHourParam = startHourUrl > 24 || startHourUrl < 0 || startHourUrl >= endHourUrl ? '0' : startHourUrl;
  const endHourParam = endHourUrl > 24 || endHourUrl < 0 || endHourUrl <= startHourUrl ? 24 : endHourUrl;
  const page = parseInt(searchParams?.get('page') || '1');

  const endDateToString = endDateDefault.toISOString();
  const startDateToString = startDateDefault.toISOString();

  const limitUrl = PAGINATIONLIMIT.includes(parseInt(searchParams?.get('limit') || '10'))
    ? parseInt(searchParams?.get('limit') || '') || 10
    : 10;
  const totalPage = useMemo(() => {
    const total = salesSummaryData?.totalRow;
    if (!isNaN(total)) {
      return Math.ceil(total / limitUrl);
    }
    return 1;
  }, [salesSummaryData, limitUrl]);

  const pageUrl = useMemo(() => (page > 0 && page <= totalPage ? page : 1), [page]);

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

  useEffect(() => {
    let URL = '/sales-summary?';
    let salesByItemURL = '/sales-by-item?';

    if (!queryParams?.endTime && !queryParams?.startTime) {
      URL += serializeFilters({
        startHour: 0,
        endHour: 24,
        startTime: queryParams?.startTime || startDateToString,
        endTime: queryParams?.endTime || endDateToString,
        page: 1,
        limit: 10,
      });
    } else {
      URL += serializeFilters({
        startHour: queryParams?.startHourFilter || '0',
        endHour: queryParams?.endHourFilter || 24,
        endTime: queryParams?.endTime || '',
        startTime: queryParams?.startTime || '',
        page: queryParams?.page || 1,
        limit: queryParams?.limit || 10,
      });
      salesByItemURL += serializeFilters({
        endTime: queryParams?.endTime || '',
        startTime: queryParams?.startTime || '',
        search: salesByItemQueryParams?.search || '',
        categories: salesByItemQueryParams?.categories || '',
        page: salesByItemQueryParams?.page || 1,
        limit: salesByItemQueryParams?.limit || 10,
      });
    }
    setDateRange([
      new Date(queryParams?.startTime) || startDateDefault,
      new Date(queryParams?.endTime) || endDateDefault,
    ]);

    dispatch(
      updateQueryParams({
        key: 'sales-by-item',
        value: {
          ...salesByItemQueryParams,
          endTime: queryParams?.endTime,
          startTime: queryParams?.startTime,
        },
      }),
    );
    router.push(URL);
    dispatch(updateURLPages({ 'sales-by-item': `${salesByItemURL}` }));
  }, [
    queryParams?.startHourFilter,
    queryParams?.endHourFilter,
    queryParams?.page,
    queryParams?.endTime,
    queryParams?.startTime,
    queryParams?.limit,
  ]);

  useEffect(() => {
    if (searchParams) {
      if (isEqual(startHourParam, 0) && isEqual(endHourParam, 24)) {
        setHourPeriodLabel('All day');
        setValueFIlterByHour('All day');
      } else {
        setHourPeriodLabel(`From: ${startHourParam}h - to: ${endHourParam}h`);
        setValueFIlterByHour('Custom period');
      }
      setDateRange([new Date(startTimeUrl || ''), new Date(endTimeUrl || '')]);
      dispatch(
        updateQueryParams({
          key: 'sales-summary',
          value: {
            ...queryParams,
            startHourFilter: startHourParam,
            endHourFilter: endHourParam,
            endTime: endTimeUrl,
            startTime: startTimeUrl,
            page: pageUrl,
            limit: limitUrl,
          },
        }),
      );

      dispatch(updateURLPages({ 'sales-summary': `/sales-summary?${searchParams}` }));
    }
  }, [searchParams]);

  const saleData = salesSummaryData?.saleData;
  const tableData = salesSummaryData?.data.map((item: SaleSummaryType) => ({
    ...item,
    grossSales: formatPrice(item.grossSales),
    refunds: formatPrice(item.refunds),
    discounts: formatPrice(item.discounts),
    netSales: formatPrice(item.netSales),
    estProfits: formatPrice(item.estimatedProfit),
  }));

  const SalesSummaryButton = [
    { label: 'Gross sales', value: formatPrice(saleData?.grossSales) },
    { label: 'Refunds', value: formatPrice(saleData?.refunds) },
    { label: 'Discounts', value: formatPrice(saleData?.totalDiscounts) },
    { label: 'Net sales', value: formatPrice(saleData?.netSales) },
    { label: 'Est. profit', value: formatPrice(saleData?.estimatedProfit) },
  ];
  const chartData = generateChartData(salesSummaryData, typeChart);

  const columns: ColumnsType<SaleSummaryType> = [
    {
      title: 'Time',
      dataIndex: 'time',
      width: 160,
      render: (time) => <p>{getFormatDateTime(time)}</p>,
    },
    {
      title: 'Gross Sales',
      dataIndex: 'grossSales',
      width: 80,
    },
    {
      title: 'Refunds',
      dataIndex: 'refunds',
      width: 80,
    },
    {
      title: 'Discounts',
      responsive: ['md'],
      dataIndex: 'discounts',
      width: 80,
    },
    {
      title: 'Net Sales',
      responsive: ['md'],
      dataIndex: 'netSales',
      width: 80,
    },
    {
      title: 'Est. Profit',
      responsive: ['md'],
      dataIndex: 'estProfits',
      width: 80,
    },
  ];

  const handleUpdateParamsToURL = (values: { [key: string]: any }) => {
    dispatch(updateQueryParams({ key: 'sales-summary', value: values }));
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

  const handleChangeCustomTime = (value: any) => {
    handleUpdateParamsToURL({
      startHourFilter: value?.[0].$H.toString(),
      endHourFilter: value?.[1].$H.toString(),
      page: 1,
      limit: 10,
    });

    if (valueFIlterByHour === 'Custom period') {
      handleUpdateParamsToURL({
        startHourFilter: value?.[0].$H.toString(),
        endHourFilter: value?.[1].$H.toString(),
        page: 1,
        limit: 10,
      });
    }
  };
  const exportToCSV = () => {
    const exportData = salesSummaryData?.allData.map((row: any) => ({
      time: getFormatDateTime(row.time),
      grossSales: formatPrice(row.grossSales),
      refunds: formatPrice(row.refunds),
      discounts: formatPrice(row.discounts),
      netSales: formatPrice(row.netSales),
      estProfit: formatPrice(row.estimatedProfit),
    }));
    const columNames = ['Time', 'Gross Sales', 'Refunds', 'Discounts', 'Net Sales', 'Est. Profit'];
    handleDownloadCSV(
      exportData,
      `${getFormatDate(queryParams?.startTime)}-${getFormatDate(queryParams?.endTime)} Sales Summary Report.csv`,
      columNames,
    );
  };
  const handleChangeHourPeriodOption = (value: any) => {
    if (value === 'All day') {
      handleUpdateParamsToURL({ startHourFilter: '0', endHourFilter: '24', page: 1, limit: 10 });
    }
    if (value === 'Custom period') {
      handleUpdateParamsToURL({
        startHourFilter: queryParams?.startHourFilter,
        endHourFilter: queryParams?.endHourFilter,
        page: 1,
        limit: 10,
      });
    }
    setValueFIlterByHour(value);
  };
  return (
    <div className="bg-white rounded-2xl p-[25px] flex flex-col space-y-[30px] sales-summary-container">
      <div className="flex flex-row justify-between summary-filter-bar">
        <div className="flex flex-row filter-summary-container">
          <div className={`date-range-filter z-20 w-[327px]`}>
            <DateRangePicker dateRange={dateRange} onChange={handleChangeDateRangePicker} />
          </div>
          <div className={`time-filter w-[199px]`}>
            <DropdownHourPeriod
              id="time"
              className={``}
              // options={OptionHourPeriod}
              labelItem={hourPeriodLabel}
              onChange={(value) => handleChangeHourPeriodOption(value)}
              value={valueFIlterByHour}
              endHour={(queryParams?.endHourFilter || 24).toString()}
              startHour={(queryParams?.startHourFilter || 0).toString()}
              handleChangeCustomTime={handleChangeCustomTime}
            />
          </div>
        </div>
        <Button
          className={`max-w-[190px] ${isMobile && 'hidden'} `}
          variant="secondary"
          disabled={isLoadingData}
          onClick={exportToCSV}
        >
          Export report
        </Button>
      </div>
      <div className="flex flex-row w-full ">
        <CardsReport
          data={SalesSummaryButton}
          handleChange={(label) => {
            setTypeChart(label.toLowerCase());
          }}
        />
      </div>
      <div>
        <AreaChart data={chartData} />
      </div>
      <div className="h-full">
        <Table
          className="h-fit"
          noScroll={true}
          columns={columns}
          dataSource={tableData}
          isLoading={isLoadingData}
          cursorPointerOnRow={false}
          page={pageUrl || 1}
          rowPerPage={limitUrl || 10}
          totalPage={totalPage}
          routerLink="/sales-summary"
          keyPage="sales-summary"
        />
      </div>
    </div>
  );
};

export default SalesSummary;
