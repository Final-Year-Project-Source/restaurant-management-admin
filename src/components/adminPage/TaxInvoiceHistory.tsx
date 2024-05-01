'use client';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { ConfigProvider } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import Image from 'next/image';

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
      title: 'Món ăn',
      dataIndex: 'key',
      ellipsis: true,
      width: isMobile ? 50 : 70,
    },
    {
      title: 'Mô tả',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      width: isMobile ? 42 : 100,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      width: isMobile ? 55 : 100,
    },
    {
      title: 'Tổng',
      dataIndex: 'total',
      width: isMobile ? 55 : 100,
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
          total: `฿${total}`,
          quantity: item.quantity,
          price: `฿${price}`,
        };
      });
  });

  return (
    <main className={isMobile ? 'p-[20px]' : 'px-[50px] py-[40px]'}>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <div className="bg-white flex flex-col gap-6">
          <div className="flex justify-between flex-row">
            <Image
              priority
              src={'/assets/icons/yellowlane.svg'}
              width={isMobile ? 100 : 300}
              height={isMobile ? 100 : 300}
              alt="logo"
            />
            <div className="flex flex-col items-end justify-center">
              <label className="font-semibold md:text-3xl text-xl text-left ">Hóa đơn thuế</label>
              <span className="text-right text-sm">Mã hoá đơn thuế: {tax_invoice_info?._id}</span>
              <div>{formattedDate}</div>
            </div>
          </div>
          <div className="space-y-6 overflow-y-auto pr-2 max-h-[calc(90vh-240px)]">
            <div className="flex flex-row pl-3 gap-10">
              <div className="w-1/2 flex flex-col">
                <label className="font-semibold mb-2">Người bán</label>
                <span>{`Bella Onojie Ltd.`}</span>
                <span>{`174 Nguyen Luong Bang `}</span>
                <span>{`Lien Chieu 7`}</span>
                <span>{`Da Nang`}</span>
                <span>{`Viet Nam`}</span>
                <span>Trụ sở: {`Trụ sở chính`}</span>
                <span>Tax ID: {`0105563107361`}</span>
              </div>
              <div className="w-1/2 flex flex-col">
                <label className="font-semibold mb-2">Người mua</label>
                <span>{buyerInfo?.company}</span>
                <span>{buyerInfo?.address}</span>

                <span>Trụ sở chính: {buyerInfo?.head_office}</span>

                <span>Mã số thuế: {buyerInfo?.tax_id}</span>
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
              <Table className="px-2" columns={columns} dataSource={data} pagination={false} size="small" />
            </ConfigProvider>
            <div className="w-[96%] border border-black-500 mx-auto" />
            <div className="flex pr-2 justify-end items-end">
              <div className="md:mr-[115px] mr-[20px] flex flex-col gap-4 justify-center max-[768px]:text-right items-end">
                <label>Tổng</label>
                <label>7% Phí dịch vụ</label>
                <label>10% VAT</label>
                {/* <label>Discount</label> */}
                {/* <label className="font-semibold">Grand total</label>
                <label>Balance owing</label> */}
              </div>
              <div className="flex flex-col gap-4 justify-center items-end">
                <span>{subTotal} vnđ</span>
                <span>{taxInvoiceData.vat_charge} vnđ</span>
                <span>{taxInvoiceData.service_charge} vnđ</span>
                {/* <span>-{receipt_info?.total_discount}</span> */}
                <span className="font-semibold">{taxInvoiceData.total} vnđ</span>
                <span>0</span>
              </div>
            </div>

            <div className="flex flex-row px-5 pt-[50px]">
              <div className="w-1/2 flex flex-col items-center justify-center max-[768px]:text-left">
                <div className="w-3/4 border border-black-500 mb-[15px]" />
                <label className="mb-2">Chữ ký bên bán</label>
                <span>Bella Ononjie Co., Ltd.</span>
              </div>
              <div className="w-1/2 flex flex-col items-center md:justify-center max-[768px]:text-right">
                <div className="w-3/4 border border-black-500 mb-[15px]" />
                <label className="mb-2">Chữ ký người mua</label>
                <span className="md:w-auto">{tax_invoice_info?.company}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TaxInvoice;
