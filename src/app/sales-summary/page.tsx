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
  serializeFilters,
} from '@/utils/commonUtils';
import { PAGINATIONLIMIT } from '@/utils/constants';
import { ColumnsType } from 'antd/es/table/interface';
import { isEqual } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './summary.scss';

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

interface SaleSummaryType {
  key: React.Key;
  time: string;
  grossSale: string;
  refunds: string;
  discounts: string;
  netSales: string;
  estProfit: string;
}

const format = 'HH';
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

  const { data: salesSummaryData, isLoading: isLoadingData } = useGetSalesSummaryQuery({
    page: queryParams?.page || 1,
    limit: queryParams?.limit || 10,
    start_time: queryParams?.startTime || '',
    end_time: queryParams?.endTime || '',
    end_hour: queryParams?.endHourFilter || 24,
    start_hour: queryParams?.startHourFilter || 0,
  });

  const startTimeParam = searchParams.get('start_time');
  const endTimeParam = searchParams.get('end_time');
  const startHourUrl = parseInt(searchParams.get('start_hour') || '0');
  const endHourUrl = parseInt(searchParams.get('end_hour') || '24');
  const startHourParam = startHourUrl > 24 || startHourUrl < 0 ? '0' : startHourUrl;
  const endHourParam = endHourUrl > 24 || endHourUrl < 0 ? 24 : endHourUrl;
  const page = parseInt(searchParams?.get('page') || '1');

  const limitUrl = PAGINATIONLIMIT.includes(parseInt(searchParams?.get('limit') || '10'))
    ? parseInt(searchParams?.get('limit') || '') || 10
    : 10;
  const totalPage = useMemo(() => {
    const total = salesSummaryData?.totalRow;
    if (!isNaN(total)) {
      return Math.ceil(total / limitUrl);
    }
  }, [salesSummaryData, limitUrl]);
  const pageUrl = useMemo(() => (page > 0 ? page : 1), [page]);

  useEffect(() => {
    let URL = '/sales-summary?';
    if (!queryParams?.endTime && !queryParams?.startTime) {
      URL += serializeFilters({
        startHour: 0,
        endHour: 24,
        startTime: startDateDefault.toISOString(),
        endTime: endDateDefault.toISOString(),
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
    }

    router.push(URL);
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
        setHourPeriodLabel('Cả ngày');
        setValueFIlterByHour('Cả ngày');
      } else {
        setHourPeriodLabel(`Từ: ${startHourParam}h - đến: ${endHourParam}h`);
        setValueFIlterByHour('Tuỳ chỉnh');
      }
      setDateRange([new Date(startTimeParam || startDateDefault), new Date(endTimeParam || endDateDefault)]);
      dispatch(
        updateQueryParams({
          key: 'sales-summary',
          value: {
            ...queryParams,
            startHourFilter: startHourParam,
            endHourFilter: endHourParam,
            endTime: endTimeParam,
            startTime: startTimeParam,
            page: pageUrl,
            limit: limitUrl,
          },
        }),
      );

      dispatch(updateURLPages({ 'sales-summary': `/sales-summary?${searchParams}` }));
    }
  }, [searchParams]);

  const saleData = salesSummaryData?.saleData;
  const tableData = salesSummaryData?.data;

  const SalesSummaryButton = [
    { label: 'Tổng doanh thu', value: saleData?.grossSales },
    { label: 'Hoàn tiền', value: saleData?.refunds },
    { label: 'Giảm giá', value: saleData?.totalDiscounts },
    { label: 'Doanh thu thực', value: saleData?.netSales },
    { label: 'Lợi nhuận', value: saleData?.estimatedProfit },
  ];
  const chartData = generateChartData(salesSummaryData, typeChart);

  const columns: ColumnsType<SaleSummaryType> = [
    {
      title: 'Thời gian',
      dataIndex: 'time',
      width: 160,
      render: (time) => <p>{getFormatDateTime(time)}</p>,
    },
    {
      title: 'Tổng doanh thu',
      dataIndex: 'grossSales',
      width: 80,
    },
    {
      title: 'Hoàn tiền',
      dataIndex: 'refunds',
      width: 80,
    },
    {
      title: 'Giảm giá',
      responsive: ['md'],
      dataIndex: 'discounts',
      width: 80,
    },
    {
      title: 'Doanh thu thực',
      responsive: ['md'],
      dataIndex: 'netSales',
      width: 80,
    },
    {
      title: 'Lợi nhuận',
      responsive: ['md'],
      dataIndex: 'estimatedProfit',
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

    if (valueFIlterByHour === 'Tuỳ chỉnh') {
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
      grossSales: row.grossSales,
      refunds: row.refunds,
      discounts: row.discounts,
      netSales: row.netSales,
      estProfit: row.estimatedProfit,
    }));
    const columNames = ['Thời gian', 'Tổng doanh thu', 'Hoàn tiền', 'Giảm giá', 'Doanh thu thực', 'Lợi nhuận'];
    handleDownloadCSV(
      exportData,
      `${getFormatDate(queryParams?.startTime)}-${getFormatDate(queryParams?.endTime)} Doanh_thu.csv`,
      columNames,
    );
  };
  const handleChangeHourPeriodOption = (value: any) => {
    if (value === 'Cả ngày') {
      handleUpdateParamsToURL({ startHourFilter: '0', endHourFilter: '24', page: 1, limit: 10 });
    }
    if (value === 'Tuỳ chỉnh') {
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
          Xuất thống kê
        </Button>
      </div>
      <div className="flex flex-row w-full ">
        <CardsReport
          data={SalesSummaryButton}
          handleChange={(label: string) => {
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
