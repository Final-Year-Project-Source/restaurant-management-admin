'use client';
import { getFormatDateTime } from '@/utils/commonUtils';
import React, { useRef, useState } from 'react';
import Button from '@/components/adminPage/Button';
import { open_sans } from '@/utils/fontUtils';
import { useReactToPrint } from 'react-to-print';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { SkeletonRows } from '../table/SkeletonRows';
import Stars from '../stars';
import ProductImage from '../ProductImage';
import CustomizedModal from '../modal';
import TaxInvoice from './TaxInvoiceHistory';

interface HistoryProps {
  bill: any;
  isLoading?: boolean;
}
const InfoRow = ({ name, value }: { name: string; value: string }) => {
  if (name === 'Star') {
    return <Stars size="small" disabled value={parseInt(value || '1')} />;
  } else if (name === 'Review') {
    return <span className="italic font-open-sans text-[13px]">{value}</span>;
  } else {
    11;
    return (
      <>
        <div className="text-[14px] min-w-[110px] w-[110px]">{name}</div>
        <div className="font-open-sans text-[13px]">{value}</div>
      </>
    );
  }
};

const History: React.FC<HistoryProps> = ({ bill, isLoading }) => {
  const refTaxInvoice = useRef(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState<any>();
  const { isMobile, width: browserWidth } = useWindowDimensions();
  const handlePrint = useReactToPrint({
    content: () => refTaxInvoice.current,
    documentTitle: `Invoice no.: ${bill?._id}`,
  });
  return (
    <div className={`w-full max-[1023px]:!mb-[40px]`}>
      {isLoading ? (
        <SkeletonRows />
      ) : (
        bill?.history
          ?.slice()
          .reverse()
          .map((event: any, index: number) => (
            <div key={index}>
              <div className="bg-black-500 h-[0.5px] w-full" />
              <div
                className={`w-full flex p-[25px] space-x-[35px] ${
                  index === bill.history.length - 1 ? `pb-[15px]` : `pb-[50px]`
                }`}
              >
                {isMobile ? (
                  <></>
                ) : (
                  <div className="text-[13px] min-w-fit h-full font-open-sans">
                    {getFormatDateTime(event.create_at)}
                  </div>
                )}
                <div className="w-full">
                  <>
                    {isMobile ? (
                      <div className="flex">
                        <div className="flex w-full">
                          <div className="text-[14px] font-medium">{event.title}</div>
                        </div>
                        <div className="text-[13px] w-full font-open-sans">{getFormatDateTime(event.create_at)}</div>
                      </div>
                    ) : (
                      <div className="flex w-full">
                        <div className="text-[14px] font-medium">{event.title}</div>
                      </div>
                    )}
                    {event.info && event.info.length > 0 && (
                      <div className="flex w-full flex-col pt-[26px] space-y-[11px]">
                        {event.info.map((row: any, index: number) => (
                          <div className="flex space-x-[14px]" key={index}>
                            <InfoRow name={row.name} value={row.value.toString()} />
                          </div>
                        ))}
                      </div>
                    )}
                    {event.items && event.items.length > 0 && (
                      <div className="flex w-full max-w-[600px] flex-col w-auto pt-[26px] space-y-[11px]">
                        {event.items.map((item: any, index: number) => (
                          <>
                            <div className="flex w-full" key={index}>
                              <ProductImage
                                className="mr-6"
                                src={item.image_url}
                                width={78}
                                height={86}
                                alt="product"
                              />
                              <div
                                className={`flex flex-col  mr-2 w-full ${
                                  event.items_type === 'minus' ? 'line-through' : ''
                                }`}
                              >
                                <div className="flex justify-between items-start w-full">
                                  <p
                                    className={`text-[14px] text-black-400 ${
                                      event.items_type === 'minus' ? 'line-through' : ''
                                    }`}
                                  >
                                    {item.name}
                                  </p>
                                  <div
                                    className={`text-[11px] py-[3px] px-[7px] border-[0.5px] max-h-fit rounded-[6px] font-open-sans border-black-100 ${
                                      event.items_type === 'minus' ? 'hidden' : ''
                                    }`}
                                  >
                                    {item.status}
                                  </div>
                                </div>
                                <div className="max-w-[270px] w-full">
                                  {item.modifiers && item.modifiers?.length > 0 && (
                                    <div className="flex flex-col mt-[7px] max-w-[80%] text-[11px] text-black-500">
                                      {item.modifiers_info.map((modifier: any, index: number) => (
                                        <div key={index} className={`flex items-center justify-between font-open-sans`}>
                                          <div> Add {modifier.name}</div>
                                          {modifier?.price > 0 && (
                                            <div>
                                              <div className=" text-black-400">+ {modifier.price}</div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {item.dietary_requests && item.dietary_requests?.length > 0 && (
                                  <div className="flex flex-col mt-[7px] text-[11px] text-black-500">
                                    {item.dietary_requests.map((dietary: any, index: number) => (
                                      <div
                                        key={index}
                                        className={`flex items-center justify-between ${open_sans.className}`}
                                      >
                                        {dietary}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {item.notes && (
                                  <div
                                    className={`flex space-x-[5px] text-[11px] text-black-500 mt-[7px] ${open_sans.className}`}
                                  >
                                    <div>Notes: {item.notes}</div>
                                  </div>
                                )}
                                <div className="flex space-x-[10px] mt-[15px]">
                                  <div> x {item.quantity}</div>
                                </div>
                              </div>
                            </div>
                            {index < event.items.length - 1 && (
                              <div className="bg-black-100  h-[1px] w-full mb-[20px]"></div>
                            )}
                          </>
                        ))}
                      </div>
                    )}
                    {event.button && (
                      <Button
                        className="h-[50px] w-[142px] mt-[25px]"
                        onClick={() => {
                          setIsPrintModalOpen(true);
                          setBuyerInfo(event.tax_invoice_info);
                        }}
                      >
                        Download
                      </Button>
                    )}
                  </>
                </div>
              </div>
            </div>
          ))
      )}
      <CustomizedModal
        width={800}
        open={isPrintModalOpen}
        title=""
        onOk={handlePrint}
        onCancel={() => setIsPrintModalOpen(false)}
        okText="Print"
      >
        <div ref={refTaxInvoice} className="min-h-[32px]">
          {bill && <TaxInvoice taxInvoiceData={bill} buyerInfo={buyerInfo} />}
        </div>
      </CustomizedModal>
    </div>
  );
};

export default History;
