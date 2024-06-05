'use client';
import Button from '@/components/adminPage/Button';
import InputText from '@/components/adminPage/Input';
import Dropdown from '@/components/dropdown/Dropdown';
import { ArrowLeftIcon1 } from '@/components/Icons';
import Stars from '@/components/stars';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { toPng } from 'html-to-image';
import {
  useCancelBillMutation,
  useChangeCustomerNameMutation,
  useChangeDiscountMutation,
  useChangeTableBillMutation,
  useCreateCashPaymentReceiptMutation,
  useCreatePaymentMutation,
  useCreateTaxInvoiceMutation,
  useGetSingleBillQuery,
  useRefundBillMutation,
  useReopenBillMutation,
} from '@/redux/services/billApi';
import { useGetDiscountsQuery } from '@/redux/services/discountApi';
import { useGetDiningTablesQuery } from '@/redux/services/tableApi';
import { DiningTableType } from '@/types/tables.types';
import { getFormatDateTime } from '@/utils/commonUtils';
import { convertTablesToOptions } from '@/utils/constants';
import { QRCode, Skeleton } from 'antd';
import { debounce, lowerCase } from 'lodash';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import ReceiptDownLoadedImage from './ReceiptDownloaded';
import LoadingIndicator from '@/components/loadingIndicator';
import { validateTaxID, validateIsNotEmpty } from '@/utils/commonUtils';
import Tag from '@/components/tag/tag';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import History from '@/components/adminPage/History';
import BillTab from '@/components/billTab';
import CustomizedModal from '@/components/modal';
import CustomizedDrawer from '@/components/drawer';
import Tabs from '@/components/tabs';
import TextAreaInput from '@/components/input/TextArea';
import TaxInvoice from '@/components/adminPage/TaxInvoiceHistory';
interface PropsStateForm {
  companyName: string;
  headOffice: string;
  taxId: string;
  address: string;
}
const initStateForm: PropsStateForm = {
  companyName: '',
  headOffice: '',
  taxId: '',
  address: '',
};

const DetailBill = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const refTaxInvoice = useRef(null);
  const { isMobile, width } = useWindowDimensions();
  const { data: session } = useSession();
  const access_token = session?.user?.access_token || '';

  const urlPage = useSelector((state: RootState) => state.URLPages);
  const { data: allDiningTables, isLoading: isFetchingDiningTable } = useGetDiningTablesQuery({ access_token });
  const { data: discountsList, isLoading: isFetchingDiscount } = useGetDiscountsQuery();
  const { data: singleBill, error, isLoading: isLoadingBill } = useGetSingleBillQuery({ id: id || '' });
  const data = singleBill?.data || '';

  const tableList = allDiningTables?.data;
  const errorMessageMap = {
    companyName: 'Company name is required',
    headOffice: 'Head office is required',
    taxId: 'Invalid Tax ID (should be a 13-digit ID)',
    address: 'Address is required',
  };

  const {
    created_at,
    status,
    customer_name,
    payment_status,
    feedback_info,
    discount_info,
    tax_invoice_info,
    receipt_refund_id,
    _id,
    dining_table_id,
    dining_table_info,
  } = data;

  const cancelledBill = data.status === 'Cancelled' ? true : false;
  const discount_text = discount_info
    ? discount_info.type === 'FIXED_PERCENT'
      ? `${discount_info.name} (${discount_info.value}%)`
      : `${discount_info.name} (${discount_info.value} vnd)`
    : 'No discount';
  const [customerValue, setCustomerValue] = useState('');
  const [qrBeamPayment, setQrBeamPayment] = useState('');
  const [isModalConfirmReopenBillOpen, setIsModalConfirmReopenBillOpen] = useState(false);
  const [isModalQRBeamLinkOpen, setIsModalQRBeamLinkOpen] = useState(false);
  const [isModalBeamRefundOpen, setIsModalBeamRefundOpen] = useState(false);
  const [isModalEDCRefundOpen, setIsModalEDCRefundOpen] = useState(false);
  const [isModalPrintTaxInvoiceOpen, setIsModalPrintTaxInvoiceOpen] = useState(false);
  const [isModalCreateTaxInvoiceOpen, setIsModalCreateTaxInvoiceOpen] = useState(false);

  const [isBeamPaymentButtonActive, setIsBeamPaymentButtonActive] = useState(false);
  const [isEDCPaymentButtonActive, setIsEDCPaymentButtonActive] = useState(false);
  const [formData, setFormData] = useState<PropsStateForm>({ ...initStateForm });
  const [errors, setErrors] = useState<PropsStateForm>({ ...initStateForm });
  const [changeTable, { isLoading: isChangingTable }] = useChangeTableBillMutation();
  const [changeDiscount, { isLoading: isChangingDiscount }] = useChangeDiscountMutation();
  const [changeCustomer, { isLoading: isChangingCustomerName }] = useChangeCustomerNameMutation();
  const [createCashPaymentReceipt, { isLoading: isCreatingCashPaymentReceipt }] = useCreateCashPaymentReceiptMutation();
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();
  const [cancelBill, { isLoading: isCancelingBill }] = useCancelBillMutation();
  const [createRefund, { isLoading: isCreatingRefund }] = useRefundBillMutation();
  const [reopenBill, { isLoading: isReopeningBill }] = useReopenBillMutation();
  const [createTaxInvoice, { isLoading: isCreatingTaxInvoice }] = useCreateTaxInvoiceMutation();
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  const downloadImage = (uri: string) => {
    const fileDownloaded = document.createElement('a');
    fileDownloaded.href = uri;
    fileDownloaded.download = 'Receipt';
    fileDownloaded.click();
    setDownloadingReceipt(false);
  };

  const handleDownloadReceipt = async () => {
    setDownloadingReceipt(true);
    const receiptPage = document.getElementById('receipt');
    if (receiptPage) {
      receiptPage?.classList.remove('hidden');
      let dataUrl = '';
      const minDataLength = 2000000;
      let i = 0;
      const maxAttempts = 10;
      while (dataUrl.length < minDataLength && i < maxAttempts) {
        try {
          dataUrl = await toPng(receiptPage, {
            backgroundColor: '#f1eee8',
            includeQueryParams: true,
          });
        } catch (error) {
          setDownloadingReceipt(false);
          break;
        }
        i += 1;
      }
      if (dataUrl) {
        downloadImage(dataUrl);
      }
      receiptPage?.classList.add('hidden');
    }
  };

  const handleSubmitCustomer = () => {
    if (customerValue && customerValue.trim() !== customer_name) {
      changeCustomer({
        data: { staff_email: session?.user.email, name: customerValue.trim(), bill_id: id },
      })
        .unwrap()
        .then((response) => {})
        .catch((error) => toast.error(error?.data?.message));
    }
  };

  const handleChangeTable = (tableValue: string) => {
    if (tableValue) {
      changeTable({
        data: { bill_id: id, staff_email: session?.user.email },
        id: tableValue || '',
        access_token,
      })
        .unwrap()
        .then((response) => {})
        .catch((error) => toast.error(error?.data?.message));
    }
  };
  const handleReopenBill = () => {
    setIsModalConfirmReopenBillOpen(false);
    reopenBill({ id: id, access_token })
      .unwrap()
      .then((response) => {})
      .catch((error) => toast.error(error?.data?.message));
  };
  const handleChangeDiscount = (discountValue: string) => {
    changeDiscount({
      id: discountValue || '',
      data: { bill_id: id, staff_email: session?.user.email },
      access_token,
    })
      .unwrap()
      .then((response) => {})
      .catch((error) => toast.error(error?.data?.message));
  };
  const handleRefetchBillDataAfterPayment = () => {
    window.location.reload();
  };
  const handleCreateRefund = () => {
    setIsModalEDCRefundOpen(false);
    setIsModalBeamRefundOpen(false);
    createRefund({
      data: { bill_id: id },
      access_token,
    })
      .unwrap()
      .then((response) => {})
      .catch((error) => toast.error(error?.data?.message));
  };
  const handleCreateEDCPayment = () => {
    createCashPaymentReceipt({ id: id })
      .unwrap()
      .then((response) => {})
      .catch((error) => toast.error(error?.data?.message));
  };
  useEffect(() => {
    const debounceHandleChangeCustomerName = debounce(() => {
      handleSubmitCustomer();
    }, 1800);

    if (customerValue !== '') {
      debounceHandleChangeCustomerName();
    }

    return debounceHandleChangeCustomerName.cancel;
  }, [customerValue]);
  useEffect(() => {
    setCustomerValue(customer_name);
  }, [customer_name]);
  const onClickEDCPaymentButton = () => {
    setIsBeamPaymentButtonActive(false);
    setIsEDCPaymentButtonActive(true);
  };
  const onClickBeamPaymentButton = () => {
    setIsBeamPaymentButtonActive(true);
    setIsEDCPaymentButtonActive(false);
  };
  const onClickCancelBillButton = () => {
    cancelBill({ id: id, access_token })
      .unwrap()
      .then((response) => {})
      .catch((error) => toast.error(error?.data?.message));
  };
  const onClickRecordPaymentButton = () => {
    if (isEDCPaymentButtonActive) {
      setIsEDCPaymentButtonActive(false);
      handleCreateEDCPayment();
    }
    if (isBeamPaymentButtonActive) {
      setIsBeamPaymentButtonActive(false);
      setQrBeamPayment('');
      setIsModalQRBeamLinkOpen(true);
      createPayment({ data: { bill_id: id } })
        .unwrap()
        .then((response) => {
          setQrBeamPayment(response.data.qrCode);
        })
        .catch((error) => toast.error(error?.data?.message));
    }
  };
  const handlePrint = useReactToPrint({
    content: () => refTaxInvoice.current,
    documentTitle: `Invoice no.: ${id}`,
  });

  const handleChangeTab = (value: any) => {
    router.push(`/bills/${id}?tab=${lowerCase(value)}`);
  };
  const getTableNameById = (tableId: string | undefined) => {
    return tableList?.find((table: any) => table._id === tableId)?.name || null;
  };
  const validateFormInput = (field: keyof PropsStateForm, value: string) => {
    if (field === 'taxId') {
      return validateTaxID(value) ? '' : errorMessageMap[field];
    }
    return validateIsNotEmpty(value) ? '' : errorMessageMap[field];
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
  //Tax Invoice
  const handleInputTaxInvoiceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof PropsStateForm,
  ) => {
    const { value } = e.target;

    setFormData({
      ...formData,
      [field]: value,
    });
    setErrors({
      ...errors,
      [field]: validateFormInput(field, value.trim()),
    });
  };
  useEffect(() => {
    const dataTaxInvoice = singleBill?.data.tax_invoice_info;
    if (!data) return;
    setFormData({
      headOffice: dataTaxInvoice?.head_office,
      taxId: dataTaxInvoice?.tax_id,
      address: dataTaxInvoice?.address,
      companyName: dataTaxInvoice?.company,
    });
  }, [singleBill]);
  const isValidFormTaxInvoice =
    validateIsNotEmpty(formData.companyName) &&
    validateIsNotEmpty(formData.headOffice) &&
    validateTaxID(formData.taxId) &&
    validateIsNotEmpty(formData.address);

  const handleSubmitRequestTaxInvoiceButton = () => {
    setIsModalCreateTaxInvoiceOpen(false);
    const data = {
      head_office: formData.headOffice.trim(),
      tax_id: formData.taxId,
      bill_id: id,
      address: formData.address.trim(),
      company: formData.companyName.trim(),
      staff_email: session?.user?.email,
    };
    if (isValidFormTaxInvoice) {
      createTaxInvoice({ data: data })
        .unwrap()
        .then(() => setIsModalPrintTaxInvoiceOpen(true))
        .catch((err) => toast.error(err?.data?.message));
    }
  };
  const bodyCreateTaxInvoice = (
    <div className="pt-[11px] pb-[10px] space-y-[30px]">
      <div className="px-[8px] flex flex-col space-y-[20px]">
        <div>
          <div className="font-medium text-[14px] text-black-400 text-left"> Company/recipient name </div>
          <div className={`flex flex-col mt-[10px] font-open-sans`}>
            <InputText
              disabled={isLoadingBill}
              required
              inputTaxInvoice
              value={formData.companyName}
              onChange={(e) => handleInputTaxInvoiceChange(e, 'companyName')}
              placeholder="E.g. Company Name Co., Ltd. (required)"
              height={48}
            />
            {errors.companyName && <span className="text-[#FF3912] text-[14px] text-left">{errors.companyName}</span>}
          </div>
        </div>
        <div>
          <div className="font-medium text-[14px] text-black-400 text-left"> Branch ID </div>
          <div className={`flex flex-col mt-[10px] font-open-sans`}>
            <InputText
              disabled={isLoadingBill}
              required
              inputTaxInvoice
              value={formData.headOffice}
              onChange={(e) => handleInputTaxInvoiceChange(e, 'headOffice')}
              placeholder="E.g. Head office (required)"
              height={48}
            />
            {errors.headOffice && <span className="text-[#FF3912] text-[14px] text-left">{errors.headOffice}</span>}
          </div>
        </div>
        <div>
          <div className="font-medium text-[14px] text-black-400 text-left"> Tax ID </div>
          <div className={`flex flex-col mt-[10px] font-open-sans`}>
            <InputText
              disabled={isLoadingBill}
              required
              inputTaxInvoice
              height={48}
              value={formData.taxId}
              onChange={(e) => handleInputTaxInvoiceChange(e, 'taxId')}
              placeholder="13-digit ID (required)"
            />
            {errors.taxId && <span className="text-[#FF3912] text-[14px] text-left">{errors.taxId}</span>}
          </div>
        </div>
        <div>
          <div className="font-medium text-[14px] text-black-400 text-left"> Address</div>
          <div className={`mt-[10px] font-open-sans`}>
            <TextAreaInput
              disabled={isLoadingBill}
              required
              value={formData?.address}
              onChange={(e) => handleInputTaxInvoiceChange(e, 'address')}
              placeholder="Enter full address (required)"
            />
          </div>
          {errors.address && <div className="text-[#FF3912] text-[14px] text-left">{errors.address}</div>}
        </div>
      </div>
      <div>Once you create the tax invoice, print it off, sign it, and hand it to the customer.</div>
    </div>
  );
  const tabs = [
    {
      label: 'Bill',
      component: (
        <BillTab
          paymentStatus={payment_status}
          isLoading={
            isLoadingBill ||
            isFetchingDiningTable ||
            isFetchingDiscount ||
            isCreatingRefund ||
            isCreatingCashPaymentReceipt ||
            isReopeningBill
          }
          disabledEDC={
            data?.orders?.length < 1 ||
            status === 'Cancelled' ||
            isCreatingCashPaymentReceipt ||
            isLoadingBill ||
            isCancelingBill
          }
          disabledBeam={
            data?.orders?.length < 1 ||
            status === 'Cancelled' ||
            isCreatingCashPaymentReceipt ||
            isLoadingBill ||
            isCancelingBill
          }
          disableEDCRefund={data?.payment_id || isReopeningBill || isLoadingBill}
          disabledBeamRefund={!data?.payment_id || isReopeningBill || isLoadingBill}
          disableReceipt={!data?.receipt_info || isReopeningBill || isLoadingBill}
          disableTaxInvoice={isReopeningBill || isLoadingBill || isCancelingBill}
          disabledCancelBill={
            isLoadingBill || isCreatingCashPaymentReceipt || isCreatingCashPaymentReceipt || isCancelingBill
          }
          isEDCPaymentButtonActive={isEDCPaymentButtonActive && status !== 'Cancelled'}
          isBeamPaymentButtonActive={isBeamPaymentButtonActive && status !== 'Cancelled'}
          onClickEDCPaymentButton={onClickEDCPaymentButton}
          onClickBeamPaymentButton={onClickBeamPaymentButton}
          onClickRecordPaymentButton={onClickRecordPaymentButton}
          onClickCancelBillButton={onClickCancelBillButton}
          onClickBeamRefundButton={() => setIsModalBeamRefundOpen(true)}
          onClickEDCRefundButton={() => setIsModalEDCRefundOpen(true)}
          onClickTaxInvoiceButton={() => setIsModalCreateTaxInvoiceOpen(true)}
          onClickReceiptButton={handleDownloadReceipt}
          onClickReopenBill={() => handleReopenBill()}
          key="Bill"
          isChangeItemQuantity={true}
          billData={data}
          removeItemButton={payment_status === 'Paid' || payment_status === 'Refunded'}
        />
      ),
    },
    {
      label: 'History',
      component: (
        <History
          bill={singleBill?.data}
          isLoading={
            isLoadingBill ||
            isFetchingDiningTable ||
            isFetchingDiscount ||
            isCreatingCashPaymentReceipt ||
            isReopeningBill
          }
        />
      ),
    },
  ];

  return (
    <main className="bg-white md:rounded-2xl md:p-[25px] space-y-[30px]">
      <div className={`space-y-[30px] ${isMobile && 'pt-[20px] pb-[25px] pl-[20px] pr-[23px]'} `}>
        <div className="flex justify-between">
          <Button icon={<ArrowLeftIcon1 />} onClick={() => router.push(`${(urlPage as any)['bills']}`)}>
            Back
          </Button>
          <Button
            variant="secondary"
            disabled={payment_status !== 'Unpaid' || status === 'Cancelled'}
            onClick={() => router.push(`/bills/${id}/create-order`)}
          >
            + Create order
          </Button>
        </div>
        {downloadingReceipt && <LoadingIndicator />}
        <div className="flex lg:space-x-[107px] max-w-[900px] max-[1024px]:w-full space-y-[10px] lg:space-y-[0px] mt-[5px] md:mr-[133px] max-lg:flex-col">
          <div className="grid grid-cols-3 grid-flow-row gap-y-[10px] gap-x-[16px] justify-center items-center">
            <label className="font-medium">Date</label>
            <div className="col-span-2">
              {isLoadingBill || isFetchingDiningTable || isFetchingDiscount ? (
                <Skeleton.Input active block />
              ) : (
                <span className="col-span-2 font-open-sans text-[13px]">{getFormatDateTime(created_at)}</span>
              )}
            </div>

            <label className="font-medium">Table name</label>
            <div className="col-span-2">
              {isLoadingBill || isFetchingDiningTable || isFetchingDiscount ? (
                <Skeleton.Input active block />
              ) : cancelledBill ? (
                <span className="font-open-sans text-[13px]">{getTableNameById(dining_table_id)}</span>
              ) : (
                <Dropdown
                  mode="tags"
                  showSearch
                  id="dining_table"
                  className={`${isMobile ? `min-w-[140px]` : `min-w-[209px]`}`}
                  disabled={!!receipt_refund_id || cancelledBill || isChangingTable}
                  options={convertTablesToOptions(
                    allDiningTables?.data.filter((table: DiningTableType) => table?.isAvailable) || [],
                  )}
                  onChange={(value) => {
                    handleChangeTable(value);
                  }}
                  value={dining_table_id}
                  defaultValue={dining_table_info?.name}
                />
              )}
            </div>
            <label className="font-medium">Customer name</label>

            <div className="col-span-2">
              {isLoadingBill || isFetchingDiningTable || isFetchingDiscount ? (
                <Skeleton.Input active block />
              ) : cancelledBill ? (
                <span className="font-open-sans text-[13px]">{customer_name}</span>
              ) : (
                <InputText
                  id="customer_name"
                  className={`${isMobile ? `min-w-[140px]` : `min-w-[209px]`}`}
                  disabled={cancelledBill || isChangingCustomerName}
                  value={customerValue}
                  onChange={(e) => {
                    setCustomerValue(e.target.value);
                  }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 grid-flow-row gap-x-[10px] gap-y-[10px] justify-center items-center">
            <label className="font-medium">Discount</label>

            <div className="col-span-2">
              {isLoadingBill || isFetchingDiningTable || isFetchingDiscount ? (
                <Skeleton.Input active block />
              ) : payment_status !== 'Unpaid' || cancelledBill ? (
                <span className="font-open-sans text-[13px]">{discount_text}</span>
              ) : (
                <Dropdown
                  showSearch
                  customFilterOptionsForSearch
                  mode="tags"
                  id="discount"
                  className={`${isMobile ? `min-w-[140px]` : `min-w-[209px]`}`}
                  disabled={cancelledBill || isChangingDiscount}
                  options={discountsList?.map((item: any) => ({
                    label: renderDiscount(item),
                    value: item.id,
                    searchLabel: item.name,
                  }))}
                  value={discount_info?._id || ''}
                  defaultValue={discount_info?.name}
                  onChange={(value) => {
                    handleChangeDiscount(value);
                  }}
                />
              )}
            </div>
            <label className="font-medium">Order status</label>

            <div className="col-span-2">
              {isLoadingBill || isFetchingDiningTable || isFetchingDiscount ? (
                <Skeleton.Input active block />
              ) : (
                <span className="font-open-sans text-[13px]">{status}</span>
              )}
            </div>
            <label className="font-medium">Payment status</label>

            <div className="col-span-2">
              {isLoadingBill || isFetchingDiningTable || isFetchingDiscount ? (
                <Skeleton.Input active block />
              ) : (
                <span className="font-open-sans text-[13px]">{payment_status}</span>
              )}
            </div>
            <label className="font-medium">Review</label>
            <div className="col-span-2">
              {isLoadingBill || isFetchingDiningTable || isFetchingDiscount ? (
                <Skeleton.Input active block />
              ) : (
                <Stars value={feedback_info?.stars} size={'small'} disabled />
              )}
            </div>
          </div>
        </div>
      </div>
      <Tabs
        className={`lg:w-[233px] w-full ${isMobile && 'pl-[20px] pr-[23px]'}`}
        items={tabs}
        onChange={handleChangeTab}
      />
      <ReceiptDownLoadedImage className="hidden" bill={data} />

      {/* Modal QR Beam Link */}
      <CustomizedModal
        width={500}
        open={isModalQRBeamLinkOpen && !isMobile}
        title="Payment QR"
        onOk={handleRefetchBillDataAfterPayment}
        onCancel={() => {
          setQrBeamPayment('');
          setIsModalQRBeamLinkOpen(false);
        }}
        okText="Reload for Updating Payment Status"
      >
        <div className="min-h-[32px] mb-7 flex justify-center">
          {isCreatingPayment ? (
            <div className="bg-black-100 flex animate-pulse h-[200px]  w-[200px]" />
          ) : (
            <QRCode className="m-auto" size={200} value={qrBeamPayment} />
          )}
        </div>
      </CustomizedModal>
      <CustomizedDrawer
        className="bill-drawer"
        type="confirm"
        open={isModalQRBeamLinkOpen && isMobile}
        onClose={() => {
          setQrBeamPayment('');
          setIsModalQRBeamLinkOpen(false);
        }}
        title="Payment QR"
        okText="Reload for Updating Payment Status"
        onOk={handleRefetchBillDataAfterPayment}
        width={width}
      >
        <div className="min-h-[32px] mb-7 flex justify-center">
          {isCreatingPayment ? (
            <div className="bg-black-100 flex animate-pulse h-[200px]  w-[200px]" />
          ) : (
            <QRCode className="m-auto" size={200} value={qrBeamPayment} />
          )}
        </div>
      </CustomizedDrawer>

      {/* Modal Confirm Beam Refund  */}
      <CustomizedModal
        open={isModalBeamRefundOpen && !isMobile}
        title="Confirm"
        onOk={handleCreateRefund}
        onCancel={() => {
          setIsModalBeamRefundOpen(false);
        }}
      >
        <p className="mb-7 text-center">Are you sure you want to process a refund via PayOS for this bill?</p>
      </CustomizedModal>
      <CustomizedDrawer
        className="bill-drawer"
        type="confirm"
        open={isModalBeamRefundOpen && isMobile}
        onClose={() => setIsModalBeamRefundOpen(false)}
        title="Confirm BEAM refund"
        okText="Confirm"
        onOk={handleCreateRefund}
        width={width}
      >
        <div className="text-center">Are you sure you want to process a refund via PayOS for this bill?</div>
      </CustomizedDrawer>

      {/* Modal Confirm EDC Refund  */}
      <CustomizedModal
        open={isModalEDCRefundOpen && !isMobile}
        title="Confirm"
        onOk={handleCreateRefund}
        onCancel={() => {
          setIsModalEDCRefundOpen(false);
        }}
      >
        <p className="mb-7 text-center">Are you sure you want to process a refund via EDC for this bill?</p>
      </CustomizedModal>
      <CustomizedDrawer
        className="bill-drawer"
        type="confirm"
        open={isModalEDCRefundOpen && isMobile}
        onClose={() => setIsModalEDCRefundOpen(false)}
        title="Confirm EDC refund"
        okText="Confirm"
        onOk={handleCreateRefund}
        width={width}
      >
        <div className="text-center">Are you sure you want to process a refund via EDC for this bill?</div>
      </CustomizedDrawer>

      {/* Modal Drawer Confirm Reopen Bill  */}
      <CustomizedModal
        open={isModalConfirmReopenBillOpen && !isMobile}
        title="Confirm"
        onOk={handleReopenBill}
        onCancel={() => setIsModalConfirmReopenBillOpen(false)}
      >
        <p>Are you sure you want to reopen this bill?</p>
      </CustomizedModal>
      <CustomizedDrawer
        className="bill-drawer"
        type="confirm"
        open={isModalConfirmReopenBillOpen && isMobile}
        onClose={() => setIsModalConfirmReopenBillOpen(false)}
        title="Confirm reopen bill"
        okText="Confirm"
        onOk={handleReopenBill}
        width={width}
      >
        <div className="text-center">
          <p>Are you sure you want to reopen this bill?</p>
        </div>
      </CustomizedDrawer>

      {/* Modal Print TaxInvoice  */}
      <CustomizedModal
        width={isMobile ? 450 : 750}
        open={isModalPrintTaxInvoiceOpen && !isCreatingTaxInvoice && !isLoadingBill && !isMobile}
        title=""
        onOk={handlePrint}
        onCancel={() => setIsModalPrintTaxInvoiceOpen(false)}
        okText="Print"
      >
        <div ref={refTaxInvoice} className="min-h-[32px]">
          {data && <TaxInvoice taxInvoiceData={data} buyerInfo={tax_invoice_info} />}
        </div>
      </CustomizedModal>
      <CustomizedDrawer
        className="bill-drawer"
        type="confirm"
        open={isModalPrintTaxInvoiceOpen && !isCreatingTaxInvoice && !isLoadingBill && isMobile}
        onClose={() => setIsModalPrintTaxInvoiceOpen(false)}
        okText="Print"
        onOk={handlePrint}
        width={width}
      >
        <div ref={refTaxInvoice} className="min-h-[32px]">
          {data && <TaxInvoice taxInvoiceData={data} buyerInfo={tax_invoice_info} />}
        </div>
      </CustomizedDrawer>

      <CustomizedModal
        className="bill-drawer"
        width={400}
        open={isModalCreateTaxInvoiceOpen && !isMobile}
        onCancel={() => setIsModalCreateTaxInvoiceOpen(false)}
        title="Issue tax invoice"
        okText="Create tax invoice"
        disableOkButton={!isValidFormTaxInvoice}
        onOk={handleSubmitRequestTaxInvoiceButton}
      >
        <div className="text-center">{bodyCreateTaxInvoice}</div>
      </CustomizedModal>
      <CustomizedDrawer
        className="bill-drawer"
        open={isModalCreateTaxInvoiceOpen && isMobile}
        onClose={() => setIsModalCreateTaxInvoiceOpen(false)}
        title="Issue tax invoice"
        okText="Create tax invoice"
        onOk={handleSubmitRequestTaxInvoiceButton}
        width={width}
      >
        <div className="text-center">{bodyCreateTaxInvoice}</div>
      </CustomizedDrawer>
    </main>
  );
};

export default DetailBill;
