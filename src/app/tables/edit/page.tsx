'use client';
import Button from '@/components/adminPage/Button';
import InputText from '@/components/adminPage/Input';
import CustomizedDrawer from '@/components/drawer';
import Dropdown from '@/components/dropdown/Dropdown';
import { ArrowLeftIcon1 } from '@/components/Icons';
import CustomizedModal from '@/components/modal';
import Tag from '@/components/tag/tag';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { useGetDiscountsQuery } from '@/redux/services/discountApi';
import {
  useDeleteDiningTableMutation,
  useGetSingleDiningTableQuery,
  useUpdateDiningTableMutation,
} from '@/redux/services/tableApi';
import { DiningTableType } from '@/types/tables.types';
import { FOOTER_HEIGHT_SAVE, HEADER_LAYOUT, PADDING_TOP_TO_SCROLL } from '@/utils/constants';
import { QRCode, Skeleton } from 'antd';
import { useFormik } from 'formik';
import { isEqual } from 'lodash';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const schema = Yup.object().shape({
  name: Yup.string().required('Tên bàn ăn bắt buộc'),
  location: Yup.string().required('Vị trí bắt buộc'),
});

const EditTable = () => {
  const router = useRouter();
  const { isMobile, width: screenWidth, height } = useWindowDimensions();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollBottom } = useScrollbarState(bodyRef);

  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;
  const { data: session } = useSession();
  const { data: singleTable, isLoading } = useGetSingleDiningTableQuery({ id: id }, { skip: !id });
  const table = singleTable?.data as DiningTableType;
  const { data: discountsRes, isLoading: isFetchingDiscount } = useGetDiscountsQuery();
  const [deleteDiningTable, { isLoading: isDeleteLoading }] = useDeleteDiningTableMutation();
  const [updateDiningTable, { isLoading: isUpdateLoading }] = useUpdateDiningTableMutation();
  const discountsList = discountsRes?.data;
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  useEffect(() => {
    resetForm({
      values: {
        name: table?.name,
        discount: table?.discount,
        location: table?.location,
      },
    });
  }, [table]);

  const formik = useFormik({
    initialValues: {
      name: table?.name || '',
      discount: table?.discount || '',
      location: table?.location || '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const dataUpdate = {
        id: table?._id,
        name: values.name.trim(),
        discount: values.discount,
        location: values.location.trim(),
      };
      updateDiningTable({ access_token: session?.user?.access_token || '', data: dataUpdate })
        .unwrap()
        .then(() => {
          router.push('/tables');
        })
        .catch((error) => toast.error(error?.data?.message));
    },
  });

  const { errors, touched, values, handleChange, handleSubmit, resetForm } = formik;

  const downloadQRCode = () => {
    var svg = document.querySelector('.qr-code-table-container svg');
    svg?.removeAttribute('width');
    svg?.removeAttribute('height');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `${table.name}.svg`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
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
              ? `${item.name} (฿${item.value})`
              : '-'}
        </p>
        {((item.has_expiration && new Date(item.expiration_date) < new Date()) ||
          (item.is_limited && item.max_usage_limit < 1)) && (
          <Tag className="place-self-center" text="Expired" variant="disable" />
        )}
      </div>
    );
  };

  const handleOkDelete = () => {
    deleteDiningTable({ data: { id: table?._id }, access_token: session?.user?.access_token || '' })
      .unwrap()
      .then((response) => {
        setIsModalDeleteOpen(false);
        router.push('/tables');
      })
      .catch((error) => toast.error(error.data.message));
    setIsModalDeleteOpen(false);
  };

  const isDisabled = useMemo(() => {
    if (!values || !table) return true;
    return (
      !values?.name ||
      !values?.location ||
      (isEqual(values.name.trim(), table?.name?.trim()) &&
        isEqual(values.discount, table?.discount) &&
        isEqual(values.location.trim(), table?.location?.trim()))
    );
  }, [values, table]);

  return (
    <div
      ref={bodyRef}
      style={{ height: height - (isMobile ? FOOTER_HEIGHT_SAVE + HEADER_LAYOUT : 0) }}
      className="overflow-y-auto"
    >
      <form
        className="bg-white md:pt-[25px] pt-5 rounded-2xl md:max-w-[594px] md:min-h-[574px] md:relative"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between md:mr-[181px] md:px-[25px] px-5">
          <Button
            className="mr-2"
            icon={<ArrowLeftIcon1 />}
            disabled={isLoading || isUpdateLoading || isFetchingDiscount || isDeleteLoading}
            type="button"
            onClick={() => router.push('/tables')}
          >
            Trở lại
          </Button>
          <Button
            type="button"
            onClick={() => setIsModalDeleteOpen(true)}
            variant="primary"
            disabled={isLoading || isUpdateLoading || isFetchingDiscount || isDeleteLoading}
          >
            Xoá
          </Button>
        </div>

        <div
          className={`${
            scrollBottom > PADDING_TOP_TO_SCROLL && isMobile ? 'shadow-medium-top' : ''
          } z-10 md:h-[50px] h-[101px] max-md:px-[20px] absolute md:top-[25px] md:right-[25px] right-1/2 max-md:transform max-md:translate-x-1/2 bottom-0 md:min-w-[136px] w-full md:w-auto max-md:py-5 max-md:bg-white`}
        >
          <Button
            className="w-full max-md:!max-h-[61px] h-[61px]"
            variant="secondary"
            type="submit"
            disabled={isLoading || isUpdateLoading || isFetchingDiscount || isDeleteLoading || isDisabled}
          >
            Lưu
          </Button>
        </div>
        <div className="pt-[30px] md:pb-[30px] pb-[10px] md:px-[25px] max-md:px-5 flex flex-col space-y-4 items-center justify-center">
          <div
            className={`grid grid-flow-row space-y-[10px] justify-center items-center w-full  ${
              isMobile ? 'grid-cols-1' : 'grid-cols-4'
            }`}
          >
            <label className="font-medium md:pt-[12px]">Tên bàn</label>
            <div className="col-span-3">
              {isFetchingDiscount || isLoading ? (
                <Skeleton.Input active block />
              ) : (
                <div>
                  <InputText
                    id="name"
                    placeholder="Tên bàn"
                    value={values.name}
                    onChange={handleChange}
                    allowClear
                    disabled={isDeleteLoading || isUpdateLoading}
                  />
                  {errors.name && touched.name && <span className="text-[12px] text-red-500">{errors.name}</span>}
                </div>
              )}
            </div>

            <label className="font-medium max-md:pt-[10px]">Vị trí</label>
            <div className="col-span-3">
              {isFetchingDiscount || isLoading ? (
                <Skeleton.Input active block />
              ) : (
                <div>
                  <InputText
                    type="text"
                    id="location"
                    placeholder="Vị trí"
                    value={values.location}
                    onChange={handleChange}
                    allowClear
                    disabled={isDeleteLoading || isUpdateLoading}
                  />
                  {errors.location && touched.location && (
                    <span className="text-[12px] text-red-500">{errors.location}</span>
                  )}
                </div>
              )}
            </div>

            <label className="font-medium max-md:pt-[10px]">Loại giảm giá</label>
            <div className="col-span-3">
              {isFetchingDiscount || isLoading ? (
                <Skeleton.Input active block />
              ) : (
                <Dropdown
                  disabled={isDeleteLoading || isUpdateLoading}
                  showSearch
                  customFilterOptionsForSearch
                  mode="tags"
                  id="discount"
                  placeholder="Chọn loại giảm giá"
                  options={discountsList?.map((item: any) => ({
                    label: renderDiscount(item),
                    value: item._id,
                    searchLabel: item.name,
                  }))}
                  value={values.discount || '-'}
                  onChange={(value) => handleChange({ target: { id: 'discount', value } })}
                />
              )}
            </div>

            <label className="font-medium place-self-start mt-2">Mã QR</label>
            <div id="qrCode" className="col-span-3 w-fit">
              <div className="w-[235px] h-[235px] p-[10px]">
                {isFetchingDiscount || isLoading ? (
                  <Skeleton.Image active style={{ height: 225, width: 225 }} />
                ) : (
                  <QRCode
                    className="qr-code-table-container !w-full"
                    type="svg"
                    color="#131C15"
                    bgColor="transparent"
                    size={215}
                    value={table?.qr_code}
                  />
                )}
              </div>
              <Button
                className="w-full mt-[10px]"
                type="button"
                onClick={downloadQRCode}
                variant="primary"
                disabled={isLoading || isUpdateLoading || isFetchingDiscount || isDeleteLoading}
              >
                Download SVG
              </Button>
            </div>
          </div>
        </div>
        {isModalDeleteOpen && (
          <>
            <CustomizedModal
              className="customized-width"
              open={isModalDeleteOpen && !isMobile}
              title="Xác nhận"
              onOk={handleOkDelete}
              okText="Xoá"
              onCancel={() => setIsModalDeleteOpen(false)}
            >
              <div className="text-center text-black-400 flex flex-col mb-[30px]">
                <span>Bạn có chắc muốn xoá?</span> <span>Thao tác này không thể hoàn tác.</span>
              </div>
            </CustomizedModal>
            <CustomizedDrawer
              className="bill-drawer"
              type="confirm"
              open={isModalDeleteOpen && isMobile}
              onClose={() => setIsModalDeleteOpen(false)}
              title="Xác nhận"
              okText="Xoá"
              onOk={handleOkDelete}
              width={screenWidth}
            >
              <div className="text-center text-black-400 flex flex-col">
                <span>Bạn có chắc muốn xoá?</span> <span>Thao tác này không thể hoàn tác.</span>
              </div>
            </CustomizedDrawer>
          </>
        )}
      </form>
    </div>
  );
};
export default EditTable;
