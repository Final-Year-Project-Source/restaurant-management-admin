'use client';
import CardsReport from '@/components/cardsReport';
import DateRangePicker from '@/components/dateRangePicker';
import Stars from '@/components/stars';
import Table from '@/components/table/Table';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { updateURLPages } from '@/redux/features/pageSlice';
import { updateQueryParams } from '@/redux/features/queryParamsSlice';
import { useGetFeedbacksQuery, useGetLabelCountQuery } from '@/redux/services/feedbackApi';
import { RootState } from '@/redux/store';
import { getFormatDateTime, serializeFilters } from '@/utils/commonUtils';
import { endDateDefault, LABEL_PREDICT_SENTIMENT, PAGINATIONLIMIT, startDateDefault } from '@/utils/constants';
import { ColumnsType } from 'antd/es/table';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './feedbacks.scss';

interface SaleSummaryType {
  key: React.Key;
  time: string;
  grossSale: string;
  refunds: string;
  discounts: string;
  netSales: string;
  estProfit: string;
}

const FeedbackPage = () => {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { isMobile, width } = useWindowDimensions();
  const router = useRouter();

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([startDateDefault, endDateDefault]);
  const queryParams = useSelector((state: RootState) => state.queryParams['feedbacks']);

  const { data: feedbackData, isLoading: isLoadingData } = useGetFeedbacksQuery({
    page: queryParams?.page || 1,
    limit: queryParams?.limit || 10,
    start_time: queryParams?.startTime || '',
    end_time: queryParams?.endTime || '',
    labelSentiment: queryParams?.labelSentiment || LABEL_PREDICT_SENTIMENT.POSITIVE,
  });

  const { data: labelCounts } = useGetLabelCountQuery({
    start_time: queryParams?.startTime || '',
    end_time: queryParams?.endTime || '',
  });

  const startTimeParam = searchParams.get('start_time');
  const endTimeParam = searchParams.get('end_time');

  const page = parseInt(searchParams?.get('page') || '1');

  const limitUrl = PAGINATIONLIMIT.includes(parseInt(searchParams?.get('limit') || '10'))
    ? parseInt(searchParams?.get('limit') || '') || 10
    : 10;

  const pageUrl = useMemo(() => (page > 0 ? page : 1), [page]);

  const tableData = feedbackData?.data.map((item: any) => ({
    ...item,
    bill_name: item?.bill?.customer_name,
  }));
  useEffect(() => {
    let URL = '/feedbacks?';
    if (!queryParams?.endTime && !queryParams?.startTime) {
      URL += serializeFilters({
        startTime: startDateDefault.toISOString(),
        endTime: endDateDefault.toISOString(),
        page: 1,
        limit: 10,
      });
    } else {
      URL += serializeFilters({
        endTime: queryParams?.endTime || '',
        startTime: queryParams?.startTime || '',
        page: queryParams?.page || 1,
        limit: queryParams?.limit || 10,
      });
    }

    router.push(URL);
  }, [queryParams?.page, queryParams?.endTime, queryParams?.startTime, queryParams?.limit]);

  useEffect(() => {
    if (searchParams) {
      setDateRange([new Date(startTimeParam || startDateDefault), new Date(endTimeParam || endDateDefault)]);
      dispatch(
        updateQueryParams({
          key: 'feedbacks',
          value: {
            ...queryParams,

            endTime: endTimeParam,
            startTime: startTimeParam,
            page: pageUrl,
            limit: limitUrl,
          },
        }),
      );

      dispatch(updateURLPages({ feedbacks: `/feedbacks?${searchParams}` }));
    }
  }, [searchParams]);

  const SalesSummaryButton = [
    {
      title: 'Feedbacks',
      options: [
        { label: 'Positive', value: labelCounts?.positive },
        { label: 'Neutral', value: labelCounts?.neutral },
        { label: 'Negative', value: labelCounts?.negative },
      ],
    },
    // {
    //   title: 'Stars',
    //   options: [
    //     { label: 5, value: 100 },
    //     { label: 4, value: 500 },
    //     { label: 3, value: 1000 },
    //     { label: 2, value: 2 },
    //     { label: 1, value: 5 },
    //   ],
    // },
  ];

  const columns: ColumnsType<any> = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      render: (time) => <p>{getFormatDateTime(time)}</p>,
    },
    {
      title: 'Bill name',
      dataIndex: 'bill_name',
    },
    {
      title: 'Email',
      dataIndex: 'contact_email',
    },
    {
      title: 'Phone',
      dataIndex: 'contact_phone',
    },
    {
      title: 'Review',
      dataIndex: 'stars',
      render: (_, record) => (
        <div className="overflow-hidden">
          <Stars value={record.stars} size={'small'} disabled />
        </div>
      ),
      width: 150,
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
    },
  ];

  const handleUpdateParamsToURL = (values: { [key: string]: any }) => {
    dispatch(updateQueryParams({ key: 'feedbacks', value: values }));
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

  return (
    <div className="bg-white rounded-2xl p-[25px] flex flex-col space-y-[30px] sales-summary-container">
      <div className="flex flex-row justify-between summary-filter-bar">
        <div className="flex flex-row filter-summary-container">
          <div className={`date-range-filter z-20 w-[327px]`}>
            <DateRangePicker dateRange={dateRange} onChange={handleChangeDateRangePicker} />
          </div>
        </div>
      </div>

      <CardsReport
        className="feedback-buttons"
        data={SalesSummaryButton}
        handleChange={(label: string) => handleUpdateParamsToURL({ labelSentiment: label.toUpperCase() })}
        isFeedback
        value={queryParams?.labelSentiment}
      />

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
          totalPage={feedbackData?.totalPages}
          routerLink="/feedbacks"
          keyPage="feedbacks"
        />
      </div>
    </div>
  );
};
export default FeedbackPage;
