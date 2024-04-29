'use client';
import Button from '@/components/adminPage/Button';
import InputText from '@/components/adminPage/Input';
import DatePickerElement from '@/components/datePicker';
import { ArrowLeftIcon1 } from '@/components/Icons';
import { RadioGroup } from '@/components/radio';
import { DISCOUNT_TYPE } from '@/enums';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { useAddDiscountMutation } from '@/redux/services/discountApi';
import { FOOTER_HEIGHT_SAVE, HEADER_LAYOUT, PADDING_TOP_TO_SCROLL } from '@/utils/constants';
import { useFormik } from 'formik';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const schema = Yup.object().shape({
  name: Yup.string().required('Loại giảm giá bắt buộc'),
});

const AddDiscount = () => {
  const router = useRouter();
  const { isMobile, height } = useWindowDimensions();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollBottom } = useScrollbarState(bodyRef);

  const { data: session } = useSession();
  const [addDiscount, { isLoading: isAddLoading }] = useAddDiscountMutation();
  const today = new Date();
  today.setHours(23, 59, 0, 0);
  const [discountAmountError, setDiscountAmountError] = useState(false);
  const [discountPercentError, setDiscountPercentError] = useState(false);
  const [quantityError, setQuantityError] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      type: DISCOUNT_TYPE.FIXED_PERCENT,
      discount_amount: 0,
      discount_percent: 0,
      expiration_date: today,
      max_usage_limit: 0,
      is_limited: true,
      has_expiration: true,
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
        name: name.trim(),
        type: type,
        value: discount_amount || discount_percent,

        expiration_date: has_expiration ? expiration_date : null,
        max_usage_limit: is_limited ? max_usage_limit : null,
        is_limited: is_limited,
        has_expiration: has_expiration,
      };
      addDiscount({ access_token: session?.user?.access_token || '', data: data })
        .unwrap()
        .then(() => {
          router.push('/discounts');
        })
        .catch((error) => toast.error(error?.data?.message));
    },
  });

  const { errors, touched, values, handleChange, handleSubmit, resetForm, setValues } = formik;

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

  const isDisabled =
    !values?.name ||
    !values?.type ||
    (values?.is_limited && !values?.max_usage_limit) ||
    (values?.has_expiration && !values?.expiration_date) ||
    (values?.type === DISCOUNT_TYPE.FIXED_AMOUNT && !values?.discount_amount) ||
    (values?.type === DISCOUNT_TYPE.FIXED_PERCENT && !values?.discount_percent) ||
    discountAmountError ||
    discountPercentError ||
    quantityError;

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
        {/* Header */}
        <Button
          className="w-[142px] md:ml-[25px] ml-5"
          variant="primary"
          icon={<ArrowLeftIcon1 />}
          disabled={isAddLoading}
          onClick={() => router.back()}
          type="button"
        >
          Trở lại
        </Button>

        {/* Save Button */}
        <div
          className={`${
            scrollBottom > PADDING_TOP_TO_SCROLL && isMobile ? 'shadow-medium-top' : ''
          } z-10 md:h-[50px] h-[101px] max-md:px-[20px] absolute md:top-[25px] md:right-[25px] right-1/2 max-md:transform max-md:translate-x-1/2 bottom-0 md:min-w-[136px] w-full md:w-auto max-md:py-5 max-md:bg-white`}
        >
          <Button
            className="w-full max-md:!max-h-[61px] h-[61px]"
            variant="secondary"
            type="submit"
            disabled={isAddLoading || isDisabled}
          >
            Lưu
          </Button>
        </div>

        <div className="pt-[30px] md:px-[25px] max-md:px-5 max-md:pb-[10px] grid md:grid-cols-5 grid-cols">
          <label className="col-span-2 md:mt-[10px] font-medium max-md:pb-[10px]">Loại giảm giá</label>

          <div className="col-span-3">
            <InputText
              name="name"
              placeholder="Loại giảm giá"
              required
              disabled={isAddLoading}
              value={values?.name}
              onChange={handleChangeInput}
            />
            {errors.name && touched.name && typeof errors.name === 'string' && (
              <span className="text-[12px] text-red-500">{errors.name}</span>
            )}
          </div>
          <label className="col-span-2 font-medium pt-[20px]">Kiểu</label>
          <div className="col-span-3 flex flex-col md:space-y-5 space-y-[10px] md:pt-[7px]">
            <RadioGroup
              disabled={isAddLoading}
              className="space-x-[25px]"
              options={[{ label: 'Phần trăm' }, { label: 'Số lượng' }]}
              groupName=""
              value={values?.type === DISCOUNT_TYPE.FIXED_PERCENT ? 'Phần trăm' : 'Số lượng'}
              onChange={handleRadioGroupTypeChange}
            />

            {values?.type === DISCOUNT_TYPE.FIXED_PERCENT ? (
              <>
                <div className="md:w-[136px] w-[130px]">
                  <InputText
                    disabled={isAddLoading}
                    name="discount_percent"
                    suffix={<span className="text-black-250">%</span>}
                    value={values?.discount_percent || ''}
                    onChange={handleChangeInput}
                  />
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
                  <InputText
                    disabled={isAddLoading}
                    name="discount_amount"
                    value={values?.discount_amount || ''}
                    onChange={handleChangeInput}
                  />
                </div>
                {discountAmountError && <span className="text-[12px] text-red-500">Phải là kiểu số</span>}
              </>
            )}
          </div>
          <label className="col-span-2 font-medium pt-[20px]">Số lượng người dùng</label>
          <div className="col-span-3 flex flex-col md:space-y-5 space-y-[10px] md:pt-[7px]">
            <RadioGroup
              disabled={isAddLoading}
              className="space-x-[35px]"
              options={[{ label: 'Không giới hạn' }, { label: 'Giới hạn' }]}
              groupName=""
              value={values?.is_limited ? 'Giới hạn' : 'Không giới hạn'}
              onChange={handleRadioGroupUseChange}
            />
            <div>
              {values?.is_limited && (
                <>
                  <div className="md:w-[136px] w-[130px]">
                    <InputText
                      disabled={isAddLoading}
                      name="max_usage_limit"
                      placeholder="Số lượng"
                      value={values.max_usage_limit || ''}
                      onChange={handleChangeInput}
                    />
                  </div>

                  {quantityError && <span className="text-[12px] text-red-500">Phải là kiểu số</span>}
                </>
              )}
            </div>
          </div>
          <label className="col-span-2 font-medium pt-[20px]">Hết hạn</label>
          <div className="col-span-3 flex flex-col md:space-y-5 space-y-[10px] md:pt-[7px]">
            <RadioGroup
              disabled={isAddLoading}
              className="space-x-[60px]"
              options={[{ label: 'Không giới hạn' }, { label: 'Ngày hết hạn' }]}
              groupName=""
              value={values?.has_expiration ? 'Ngày hết hạn' : 'Không giới hạn'}
              onChange={(value) => formik.setFieldValue('has_expiration', value === 'Không giới hạn' ? false : true)}
            />
            {values.has_expiration && (
              <DatePickerElement
                disabled={isAddLoading}
                startDate={values?.expiration_date || today}
                onChange={(date) => {
                  formik.setFieldValue('expiration_date', date);
                }}
              />
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
export default AddDiscount;
