'use client';
import Button from '@/components/adminPage/Button';
import Table from '@/components/table/Table';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { useGetDiscountsQuery } from '@/redux/services/discountApi';
import { DiscountType } from '@/types/discounts.types';
import { getFormatDateTime } from '@/utils/commonUtils';
import { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './discount.scss';

export default function Discount() {
  const router = useRouter();
  const { isMobile, width: screenWidth } = useWindowDimensions();

  const { data: dataRes, isLoading } = useGetDiscountsQuery();
  const listOfDiscount = dataRes?.data;

  const [Discounts, setDiscounts] = useState<DiscountType[]>([]);

  useEffect(() => {
    if (!listOfDiscount) return;
    setDiscounts(listOfDiscount);
  }, [listOfDiscount]);

  const columns: ColumnsType<DiscountType> = [
    {
      title: 'Loại giảm giá',
      dataIndex: 'name',

      render: (_, record) => {
        const isExpired = new Date() > new Date(record?.expiration_date) && record?.has_expiration;

        const isAvailable = record?.is_available;

        return (
          <span className={`${isExpired || !isAvailable ? 'text-black-250' : ''} discount-cell`}> {record.name}</span>
        );
      },
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      render: (_, record) => {
        const isExpired = new Date() > new Date(record?.expiration_date) && record?.has_expiration;

        const isAvailable = record?.is_available;

        return record.type === 'FIXED_PERCENT' ? (
          <span className={`${isExpired || !isAvailable ? 'text-black-250' : ''} discount-cell`}>{record.value}%</span>
        ) : (
          <span className={`${isExpired || !isAvailable ? 'text-black-250' : ''} discount-cell`}>
            {record.value} THB
          </span>
        );
      },
    },
    {
      title: 'Số lượng người dùng',
      dataIndex: 'use',
      responsive: ['md'],
      render: (_, record) => {
        const isExpired = new Date() > new Date(record?.expiration_date) && record?.has_expiration;

        const isAvailable = record?.is_available;

        return record?.is_limited ? (
          <span className={`${isExpired || !isAvailable ? 'text-black-250' : ''} discount-cell`}>
            {record?.max_usage_limit} người dùng
          </span>
        ) : (
          <span className={`${isExpired || !isAvailable ? 'text-black-250' : ''} discount-cell`}>Không giới hạn</span>
        );
      },
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiry',
      render: (_, record) => {
        const isExpired = new Date() > new Date(record?.expiration_date) && record?.has_expiration;
        const isAvailable = record?.is_available;

        return (
          <span className={`${isExpired || !isAvailable ? 'text-black-250' : ''} discount-cell`}>
            {record?.expiration_date
              ? new Date() > new Date(record?.expiration_date)
                ? 'Expired'
                : getFormatDateTime(record?.expiration_date)
              : '-'}
          </span>
        );
      },
    },
  ];

  const handleRowClick = (record: DiscountType) => {
    router.push(`discounts/edit?id=${record?._id}`);
  };

  return (
    <div className="flex flex-col space-y-[10px] md:max-w-[633px] w-full bg-white rounded-2xl">
      <div className="flex items-center justify-end md:pt-[25px] pt-5 md:pr-[25px] pr-5">
        <Button
          className="max-w-[177px]"
          variant="secondary"
          disabled={isLoading}
          onClick={() => router.push(`discounts/add`)}
        >
          + Tạo loại giảm giá
        </Button>
      </div>
      <Table
        maxWidth={isMobile ? screenWidth : 633}
        className="border-bottom discount-customized"
        columns={columns}
        cursorPointerOnRow
        dataSource={Discounts}
        isLoading={isLoading}
        hiddenPagination
        onRowClick={(record) => handleRowClick(record)}
      />
    </div>
  );
}
