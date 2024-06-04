'use client';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { formatPrice } from '@/utils/commonUtils';
import { ConfigProvider } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import Image from 'next/image';
import React from 'react';
import './taxInvoice.scss';

const TaxInvoice = ({
  taxInvoiceData,
  isLoading,
  buyerInfo,
}: {
  taxInvoiceData: any;
  isLoading?: boolean;
  buyerInfo: any;
}) => {
  const currentDate = new Date();
  const formattedDate = dayjs(currentDate).format('D MMMM YYYY');
  const { height, isMobile } = useWindowDimensions();
  const { tax_invoice_info, receipt_info, taxes_info, orderItems } = taxInvoiceData || {};
  const subTotal = taxInvoiceData?.sub_total;
  const columns: ColumnsType<any> = [
    {
      title: 'Item',
      dataIndex: 'key',
      ellipsis: true,
      width: 50,
      align: 'center',
    },
    {
      title: 'Description',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      width: isMobile ? 42 : 60,
      align: 'center',
    },
    {
      title: 'Cost',
      dataIndex: 'price',
      width: 100,
      align: 'right',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      width: 100,
      align: 'right',
    },
  ];
  let index = 0;
  const data = taxInvoiceData.orders?.flatMap((order: any) => {
    return order.items
      .filter((item: any) => item.status !== 'Cancelled')
      .map((item: any) => {
        const total = item.total_price_items_after_discount;
        const price = total / item.quantity;
        ++index;
        return {
          key: index,
          name: item.name,
          total: `${formatPrice(total)} vnd`,
          quantity: item.quantity,
          price: `${formatPrice(price)} vnd`,
        };
      });
  });
  return (
    <main className={isMobile ? 'p-[20px]' : 'px-[50px] py-[40px]'}>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <div className="bg-white flex flex-col gap-6 ">
          <div className="flex justify-between flex-row">
            <Image
              priority
              src="/assets/icons/mini-logo.svg"
              width={isMobile ? 50 : 75}
              height={isMobile ? 50 : 75}
              alt="logo"
            />
            <div className="flex flex-col items-end justify-center">
              <label className="font-semibold md:text-3xl text-xl text-left ">Tax Invoice</label>
              <span className="text-right text-sm">Invoice no.: {tax_invoice_info?._id}</span>
              <div>{formattedDate}</div>
            </div>
          </div>
          <div className="space-y-6 scroll-container">
            <div className="flex flex-row pl-3 gap-10">
              <div className="w-1/2 flex flex-col">
                <span>{`Bella Onojie Ltd.`}</span>
                <span>{`174 Nguyen Luong Bang `}</span>
                <span>{`Lien Chieu 7`}</span>
                <span>{`Da Nang`}</span>
                <span>{`Viet Nam`}</span>
                <span>Trụ sở: {`Trụ sở chính`}</span>
                <span>Tax ID: {`0105563107361`}</span>
              </div>
              <div className="w-1/2 flex flex-col">
                <label className="font-semibold mb-2">Buyer</label>
                <span>{buyerInfo?.company}</span>
                <span>
                  {buyerInfo?.address.split('\n').map((line: string, index: number) => (
                    <React.Fragment key={index}>
                      {line}
                      {index !== buyerInfo.address.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </span>

                <span>Branch: {buyerInfo?.head_office}</span>

                <span>Tax ID: {buyerInfo?.tax_id}</span>
              </div>
            </div>
            <ConfigProvider
              theme={{
                components: {
                  Table: {
                    headerBg: '#131C16',
                    headerSplitColor: '#131C16',
                    headerColor: 'white',
                    borderColor: 'transparent',
                  },
                },
                token: {
                  borderRadius: 0,
                },
              }}
            >
              <Table columns={columns} dataSource={data} pagination={false} size="small" />
            </ConfigProvider>
            <div className="w-[96%] border border-black-500 mx-auto" />
            <div className="flex pr-2 justify-end items-end">
              <div className="mr-5 flex flex-col gap-4 justify-center max-[768px]:text-right items-end">
                <label>Subtotal</label>
                <label>7% Service charge</label>
                <label>10% VAT</label>
                {/* <label>Discount</label> */}
                <label className="font-semibold">Grand total</label>
                <label>Balance owing</label>
              </div>
              <div className="flex flex-col gap-4 justify-center items-end">
                <span>{formatPrice(subTotal)} vnd</span>
                <span>{formatPrice(taxInvoiceData.vat_charge)} vnd</span>
                <span>{formatPrice(taxInvoiceData.service_charge)} vnd</span>
                {/* <span>-{receipt_info?.total_discount}</span> */}
                <span className="font-semibold">{formatPrice(taxInvoiceData.total)} vnd</span>
                <span>0.00 vnd</span>
              </div>
            </div>

            <div className="flex flex-row px-5 pt-[50px]">
              <div className="w-1/2 flex flex-col items-center justify-center max-[768px]:text-left">
                <div className="w-3/4 border border-black-500 mb-[15px]" />
                <label className="mb-2">Signature of Seller</label>
                <span>Bella Ononjie Ltd.</span>
              </div>
              <div className="w-1/2 flex flex-col items-center md:justify-center max-[768px]:text-right">
                <div className="w-3/4 border border-black-500 mb-[15px]" />
                <label className="mb-2">Signature of Buyer</label>
                <span className="md:w-auto">{tax_invoice_info?.company}</span>
              </div>
            </div>
          </div>
          {/* <div className="flex justify-center items-center mt-auto text-[13px]">Page 1 of 1</div> */}
        </div>
      )}
    </main>
  );
};

export default TaxInvoice;
