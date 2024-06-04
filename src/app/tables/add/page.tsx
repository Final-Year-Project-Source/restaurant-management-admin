'use client';
import { ArrowLeftIcon1 } from '@/components/Icons';
import Button from '@/components/adminPage/Button';
import InputText from '@/components/adminPage/Input';
import Dropdown from '@/components/dropdown/Dropdown';
import Tag from '@/components/tag/tag';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { useGetDiscountsQuery } from '@/redux/services/discountApi';
import { useAddDiningTableMutation } from '@/redux/services/tableApi';
import { Skeleton } from 'antd';
import { useFormik } from 'formik';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { useMemo, useRef } from 'react';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { FOOTER_HEIGHT_SAVE, HEADER_LAYOUT, PADDING_TOP_TO_SCROLL } from '@/utils/constants';

const schema = Yup.object().shape({
  name: Yup.string().required('Missing Table'),
  location: Yup.string().required('Missing Location'),
});

const AddTable = () => {
  const router = useRouter();
  const { isMobile, height } = useWindowDimensions();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollBottom } = useScrollbarState(bodyRef);
  const { data: session } = useSession();
  const [addDiningTable, { isLoading: isAddLoading }] = useAddDiningTableMutation();
  const { data: discountsList, isFetching: isFetchingDiscount } = useGetDiscountsQuery();

  const formik = useFormik({
    initialValues: {
      name: '',
      discount: '',
      location: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const data = {
        name: values.name.trim(),
        discount: values.discount || '',
        location: values.location.trim(),
      };
      addDiningTable({ access_token: session?.user?.access_token || '', data: data })
        .unwrap()
        .then(() => {
          router.push('/tables');
          // resetForm();
        })
        .catch((error) => toast.error(error?.data?.message));
    },
  });

  const { errors, touched, values, handleChange, handleSubmit, resetForm } = formik;

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
              ? `${item.name} (${item.value}vnd)`
              : '-'}
        </p>
        {((item.has_expiration && new Date(item.expiration_date) < new Date()) ||
          (item.is_limited && item.max_usage_limit < 1)) && (
          <Tag className="place-self-center" text="Expired" variant="disable" />
        )}
      </div>
    );
  };

  const isDisabled = useMemo(() => {
    if (!values) return true;
    return !values?.name || !values?.location;
  }, [values]);

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
        <Button
          className="w-[142px] md:ml-[25px] ml-5"
          icon={<ArrowLeftIcon1 />}
          disabled={isFetchingDiscount || isAddLoading}
          type="button"
          onClick={() => router.back()}
        >
          Back
        </Button>

        <div
          className={`${
            scrollBottom > PADDING_TOP_TO_SCROLL && isMobile ? 'shadow-medium-top' : ''
          } z-10 md:h-[50px] h-[101px] max-md:px-[20px] absolute md:top-[25px] md:right-[25px] right-1/2 max-md:transform max-md:translate-x-1/2 bottom-0 md:min-w-[136px] w-full md:w-auto max-md:py-5 max-md:bg-white`}
        >
          <Button
            className="w-full max-md:!max-h-[61px] h-[61px]"
            variant="secondary"
            type="submit"
            disabled={isAddLoading || isFetchingDiscount || isDisabled}
          >
            Save
          </Button>
        </div>
        <div className="pt-[30px] md:px-[25px] max-md:px-5 max-md:pb-[10px] flex space-x-2 items-center justify-center">
          <div
            className={`grid grid-flow-row space-y-[10px] justify-center items-center w-full  ${
              isMobile ? 'grid-cols-1' : 'grid-cols-4'
            }`}
          >
            <label className="font-medium md:pt-[12px]">Table name</label>
            <div className="col-span-3">
              <InputText
                id="name"
                placeholder="Name"
                value={values.name}
                onChange={handleChange}
                allowClear
                disabled={isAddLoading}
              />
              {errors.name && touched.name && <span className="text-[12px] text-red-500">{errors.name}</span>}
            </div>
            <label className="font-medium max-md:pt-[10px]">Location</label>
            <div className="col-span-3">
              <InputText
                type="text"
                id="location"
                placeholder="Location"
                value={values.location}
                onChange={handleChange}
                allowClear
                disabled={isAddLoading}
              />
              {errors.location && touched.location && (
                <span className="text-[12px] text-red-500">{errors.location}</span>
              )}
            </div>
            <label className="font-medium max-md:pt-[10px]">Discount</label>
            <div className="col-span-3">
              <Dropdown
                disabled={isAddLoading}
                showSearch
                customFilterOptionsForSearch
                mode="tags"
                id="discount"
                placeholder="Select discount"
                options={discountsList?.map((item: any) => ({
                  label: renderDiscount(item),
                  value: item.id,
                  searchLabel: item.name,
                }))}
                value={values.discount || '-'}
                onChange={(value) => handleChange({ target: { id: 'discount', value } })}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
export default AddTable;
