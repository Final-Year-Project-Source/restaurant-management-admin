'use client';
import Button from '@/components/adminPage/Button';
import InputText from '@/components/adminPage/Input';
import DatePickerElement from '@/components/datePicker';
import CustomizedDrawer from '@/components/drawer';
import { ArrowLeftIcon1 } from '@/components/Icons';
import CustomizedModal from '@/components/modal';
import { RadioGroup } from '@/components/radio';
import { DISCOUNT_TYPE } from '@/enums';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import {
  useDeleteDiscountMutation,
  useGetSingleDiscountQuery,
  useUpdateDiscountMutation,
} from '@/redux/services/discountApi';
import { FOOTER_HEIGHT_SAVE, HEADER_LAYOUT, PADDING_TOP_TO_SCROLL } from '@/utils/constants';
import { Skeleton } from 'antd';
import { useFormik } from 'formik';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import '../discount.scss';

const schema = Yup.object().shape({
  name: Yup.string().required('Loại giảm giá bắt buộc'),
});

const EditDiscount = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get('id') as string;
  const { data: session } = useSession();
  const { isMobile, width: screenWidth, height } = useWindowDimensions();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollBottom } = useScrollbarState(bodyRef);

  const { data: singleDiscount, isLoading } = useGetSingleDiscountQuery({ id: id }, { skip: !id });
  const Discounts = singleDiscount?.data || {};
  const [updateDiscount, { isLoading: isUpdateLoading }] = useUpdateDiscountMutation();
  const [deleteDiscount, { isLoading: isDeleteLoading }] = useDeleteDiscountMutation();
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const today = new Date();
  today.setHours(23, 59, 0, 0);
  const [discountAmountError, setDiscountAmountError] = useState(false);
  const [discountPercentError, setDiscountPercentError] = useState(false);
  const [quantityError, setQuantityError] = useState(false);
  const [isChangedData, setIsChangedData] = useState(false);

  const { name, type, is_limited, max_usage_limit, expiration_date, value, has_expiration } = Discounts || {};

  useEffect(() => {
    setValues({
      ...Discounts,
      discount_amount: type === DISCOUNT_TYPE.FIXED_AMOUNT ? value : '',
      discount_percent: type === DISCOUNT_TYPE.FIXED_PERCENT ? value : '',
    });
  }, [singleDiscount]);

  const formik = useFormik({
    initialValues: {
      name: name,
      type: type,
      discount_amount: value,
      discount_percent: value,
      expiration_date: has_expiration ? expiration_date : null,
      max_usage_limit: is_limited ? max_usage_limit : null,
      is_limited: is_limited,
      has_expiration: has_expiration,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const {
        name,
        type,
        expiration_date,
        max_usage_limit,
        is_limited,
        has_expiration,
        discount_amount,
        discount_percent,
      } = values;

      const data = {
        id: id,
        name: name.trim(),
        type: type,
        value: discount_amount || discount_percent,
        expiration_date: has_expiration ? expiration_date : null,
        max_usage_limit: is_limited ? max_usage_limit : null,
        is_limited: is_limited,
        has_expiration: has_expiration,
      };
      updateDiscount({ access_token: session?.user?.access_token || '', id: id, data: data })
        .unwrap()
        .then(() => {
          router.push('/discounts');
        })
        .catch((error) => toast.error(error?.data?.message));
    },
  });

  const { errors, touched, values, handleChange, handleSubmit, resetForm, setValues } = formik;

  useEffect(() => {
    if (!Discounts || !values) return;
    setIsChangedData(
      (Discounts?.name?.trim() && Discounts.name.trim()) !== (values.name && values.name.trim()) ||
        Discounts.type !== values.type ||
        (Discounts.type === DISCOUNT_TYPE.FIXED_AMOUNT && Number(Discounts.value) !== Number(values.discount_amount)) ||
        (Discounts.type === DISCOUNT_TYPE.FIXED_PERCENT &&
          Number(Discounts.value) !== Number(values.discount_percent)) ||
        Discounts.expiration_date !== (values.has_expiration ? values.expiration_date : null) ||
        ((values.is_limited === Discounts?.is_limited) === true &&
          Number(Discounts.max_usage_limit) !== Number(values.max_usage_limit)) ||
        Discounts.is_limited !== values.is_limited ||
        Discounts.has_expiration !== values.has_expiration,
    );
  }, [Discounts, values]);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(e);
    const numericValue = parseInt(value);

    if (name === 'discount_amount') {
      setDiscountAmountError(isNaN(numericValue));
    } else if (name === 'discount_percent') {
      setDiscountPercentError(
        isNaN(numericValue) ||
          (values.type === DISCOUNT_TYPE.FIXED_PERCENT && (numericValue > 100 || numericValue <= 0)),
      );
    } else if (name === 'max_usage_limit') {
      setQuantityError(values.is_limited && isNaN(numericValue));
    }
  };

  const handleRadioGroupTypeChange = (selectedValue: string) => {
    formik.setFieldValue(
      'type',
      selectedValue === 'Phần trăm' ? DISCOUNT_TYPE.FIXED_PERCENT : DISCOUNT_TYPE.FIXED_AMOUNT,
    );
  };

  const handleRadioGroupUseChange = (selectedValue: string) => {
    formik.setFieldValue('is_limited', selectedValue === 'Giới hạn' ? true : false);
  };

  const handleOkDelete = () => {
    deleteDiscount({ data: { id: id }, access_token: session?.user?.access_token || '' })
      .unwrap()
      .then((response) => {
        setIsModalDeleteOpen(false);
        router.push('/discounts');
      })
      .catch((error) => toast.error(error.data.message));
    setIsModalDeleteOpen(false);
  };

  const isDisabled =
    !values?.name ||
    (values?.is_limited && isNaN(Number(values?.max_usage_limit))) ||
    (values?.has_expiration && !values?.expiration_date) ||
    (values?.type === DISCOUNT_TYPE.FIXED_AMOUNT && isNaN(Number(values?.discount_amount))) ||
    (values?.type === DISCOUNT_TYPE.FIXED_PERCENT &&
      (isNaN(Number(values?.discount_percent)) || values?.discount_percent <= 0 || values?.discount_percent > 100)) ||
    (values?.is_limited && isNaN(Number(values?.max_usage_limit))) ||
    !isChangedData;

  return (
    <div
      ref={bodyRef}
      style={{ height: height - (isMobile ? FOOTER_HEIGHT_SAVE + HEADER_LAYOUT : 0) }}
      className="overflow-y-auto"
    >
      <form
        className="bg-white md:pt-[25px] pt-5 rounded-2xl md:max-w-[594px] md:min-h-[569px] md:relative"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between md:mr-[156px] md:px-[25px] px-5">
          <Button
            type="button"
            className="w-[142px] mr-2"
            variant="primary"
            icon={<ArrowLeftIcon1 />}
            onClick={() => router.push('/discounts')}
            disabled={isDeleteLoading || isUpdateLoading || isLoading}
          >
            Trở lại
          </Button>
          <Button
            type="button"
            className="w-[136px]"
            onClick={() => setIsModalDeleteOpen(true)}
            disabled={isDeleteLoading || isUpdateLoading || isLoading}
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
            className={'w-full max-md:!max-h-[61px] h-[61px]'}
            variant="secondary"
            type="submit"
            disabled={isDeleteLoading || isUpdateLoading || isLoading || isDisabled}
          >
            Lưu
          </Button>
        </div>

        <div className="pt-[30px] px-[25px] max-md:pb-[10px] max-md:px-5 grid md:grid-cols-5 grid-cols">
          <label className="col-span-2 md:mt-[10px] font-medium max-md:pb-[10px]">Loại giảm giá</label>

          <div className="col-span-3">
            {isLoading ? (
              <Skeleton.Input active />
            ) : (
              <InputText
                name="name"
                placeholder="Loại giảm giá"
                required
                disabled={isDeleteLoading || isUpdateLoading || isLoading}
                value={values?.name}
                onChange={handleChangeInput}
              />
            )}
            {errors.name && touched.name && typeof errors.name === 'string' && (
              <span className="text-[12px] text-red-500">{errors.name}</span>
            )}
          </div>
          <label className="col-span-2 font-medium pt-[20px]">Kiểu</label>
          <div className="col-span-3 flex flex-col md:space-y-5 space-y-[10px] md:pt-[7px]">
            {isLoading ? (
              <Skeleton.Input active />
            ) : (
              <RadioGroup
                disabled={isDeleteLoading || isUpdateLoading || isLoading}
                className="space-x-[25px]"
                options={[{ label: 'Phần trăm' }, { label: 'Số lượng' }]}
                groupName=""
                value={values?.type === DISCOUNT_TYPE.FIXED_PERCENT ? 'Phần trăm' : 'Số lượng'}
                onChange={handleRadioGroupTypeChange}
              />
            )}

            {values?.type === DISCOUNT_TYPE.FIXED_PERCENT ? (
              <>
                <div className="md:w-[136px] w-[130px]">
                  {isLoading ? (
                    <Skeleton.Input active />
                  ) : (
                    <InputText
                      disabled={isDeleteLoading || isUpdateLoading || isLoading}
                      name="discount_percent"
                      suffix={<span className="text-black-250">%</span>}
                      value={values?.discount_percent || ''}
                      onChange={handleChangeInput}
                    />
                  )}
                </div>
                {discountPercentError && (
                  <span className="text-[12px] text-red-500">
                    Kiểu giảm giá theo phần trăm phải nằm trong khoảng từ 0 đến 100
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="md:w-[136px] w-[130px]">
                  {isLoading ? (
                    <Skeleton.Input active />
                  ) : (
                    <InputText
                      disabled={isDeleteLoading || isUpdateLoading || isLoading}
                      name="discount_amount"
                      value={values?.discount_amount || ''}
                      onChange={handleChangeInput}
                    />
                  )}
                </div>
                {discountAmountError && <span className="text-[12px] text-red-500">Phải là kiểu số</span>}
              </>
            )}
          </div>
          <label className="col-span-2 font-medium pt-[20px]">Số lượng người dùng</label>
          <div className="col-span-3 flex flex-col md:space-y-5 space-y-[10px] md:pt-[7px]">
            {isLoading ? (
              <Skeleton.Input active />
            ) : (
              <RadioGroup
                className="space-x-[35px]"
                disabled={isDeleteLoading || isUpdateLoading || isLoading}
                options={[{ label: 'Không giới hạn' }, { label: 'Giới hạn' }]}
                groupName=""
                value={values?.is_limited ? 'Giới hạn' : 'Không giới hạn'}
                onChange={handleRadioGroupUseChange}
              />
            )}
            <div>
              {values?.is_limited && (
                <>
                  <div className="md:w-[136px] w-[130px]">
                    {isLoading ? (
                      <Skeleton.Input active />
                    ) : (
                      <InputText
                        disabled={isDeleteLoading || isUpdateLoading || isLoading}
                        name="max_usage_limit"
                        placeholder="Số lượng"
                        value={values.max_usage_limit || ''}
                        onChange={handleChangeInput}
                      />
                    )}
                  </div>

                  {quantityError && <span className="text-[12px] text-red-500">Phải là kiểu số</span>}
                </>
              )}
            </div>
          </div>
          <label className="col-span-2 font-medium pt-[20px]">Hết hạn</label>
          <div className="col-span-3 flex flex-col md:space-y-5 space-y-[10px] md:pt-[7px]">
            {isLoading ? (
              <Skeleton.Input active />
            ) : (
              <RadioGroup
                className="space-x-[60px]"
                disabled={isDeleteLoading || isUpdateLoading || isLoading}
                options={[{ label: 'Không giới hạn' }, { label: 'Ngày hết hạn' }]}
                groupName=""
                value={values?.has_expiration ? 'Ngày hết hạn' : 'Không giới hạn'}
                onChange={(value) => formik.setFieldValue('has_expiration', value === 'Không giới hạn' ? false : true)}
              />
            )}
            {values.has_expiration &&
              (isLoading ? (
                <Skeleton.Input active />
              ) : (
                <DatePickerElement
                  disabled={isDeleteLoading || isUpdateLoading || isLoading}
                  startDate={values?.expiration_date || today}
                  onChange={(date) => {
                    formik.setFieldValue('expiration_date', date);
                  }}
                />
              ))}
          </div>
        </div>
        {isModalDeleteOpen && (
          <>
            <CustomizedModal
              className="modifier-modal-customized"
              open={isModalDeleteOpen && !isMobile}
              title="Confirm deletion"
              onOk={handleOkDelete}
              okText="Delete"
              onCancel={() => setIsModalDeleteOpen(false)}
            >
              <div className="text-center text-black-400 flex flex-col mb-[30px]">
                <span>Bạn có chắc muốn xoá?</span> <span>Điều này không thể được hoàn tác.</span>
              </div>
            </CustomizedModal>
            <CustomizedDrawer
              className="bill-drawer"
              type="confirm"
              open={isModalDeleteOpen && isMobile}
              onClose={() => setIsModalDeleteOpen(false)}
              title="Confirm deletion"
              okText="Delete"
              onOk={handleOkDelete}
              width={screenWidth}
            >
              <div className="text-center text-black-400 flex flex-col">
                <span>Bạn có chắc muốn xoá?</span> <span>Điều này không thể được hoàn tác.</span>
              </div>
            </CustomizedDrawer>
          </>
        )}
      </form>
    </div>
  );
};
export default EditDiscount;
