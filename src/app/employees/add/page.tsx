'use client';
import { ArrowLeftIcon1 } from '@/components/Icons';
import Button from '@/components/adminPage/Button';
import InputText from '@/components/adminPage/Input';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { useCreateNewUserMutation } from '@/redux/services/employeeApi';
import { useFormik } from 'formik';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import Dropdown from '@/components/dropdown/Dropdown';
import { FOOTER_HEIGHT_SAVE, HEADER_LAYOUT, PADDING_TOP_TO_SCROLL, ROLE_EMPLOYEE } from '@/utils/constants';
import { useMemo, useRef } from 'react';
import { useScrollbarState } from '@/hooks/useScrollbarState';
export interface UserType {
  _id: string;
  key: React.Key;
  name: string;
  email: string;
  otp_enabled: boolean;
  role: string;
  is_change_default_password: boolean;
}

const schema = Yup.object().shape({
  name: Yup.string().required('Missing name'),
  email: Yup.string().required('Missing email'),
  role: Yup.string().required('Missing role'),
});

const EditEmployee = () => {
  const router = useRouter();
  const { isMobile, height } = useWindowDimensions();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollBottom } = useScrollbarState(bodyRef);

  const [createEmployee, { isLoading: isCreating }] = useCreateNewUserMutation();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      role: null,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const dataUpdate = {
        name: values.name.trim().toLowerCase(),
        email: values.email.trim().toLowerCase(),
        role: values.role,
      };
      createEmployee({ data: dataUpdate })
        .unwrap()
        .then(() => {
          // resetForm()
          router.push('/employees');
        })
        .catch((error) => toast.error(error?.data?.message));
    },
  });
  const { errors, touched, values, handleChange, handleSubmit, resetForm } = formik;

  const isDisabled = useMemo(() => {
    if (!values) return true;
    return !values?.name || !values?.email || !values?.role;
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
          disabled={isCreating}
          type="button"
          onClick={() => router.push('/employees')}
        >
          Back
        </Button>
        <div
          className={`${
            scrollBottom > PADDING_TOP_TO_SCROLL && isMobile ? 'shadow-medium-top' : ''
          } z-10 md:h-[50px] h-[101px] max-md:px-[20px] absolute md:top-[25px] md:right-[25px] right-1/2 max-md:transform max-md:translate-x-1/2 bottom-0 md:min-w-[136px] w-full md:w-auto max-md:py-5 max-md:bg-white`}
        >
          <Button
            type="submit"
            className="w-full max-md:!max-h-[61px] h-[61px]"
            variant="secondary"
            disabled={isCreating || isDisabled}
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
            <label className="font-medium md:pt-[12px]">Employee name</label>
            <div className="col-span-3">
              <InputText
                id="name"
                placeholder="Employee name"
                disabled={isCreating}
                value={values.name}
                onChange={handleChange}
                allowClear
              />
              {errors.name && touched.name && <span className="text-[12px] text-red-500">{errors.name}</span>}
            </div>
            <label className="font-medium max-md:pt-[10px]">Email</label>
            <div className="col-span-3">
              <InputText
                type="text"
                id="email"
                disabled={isCreating}
                placeholder="Email"
                value={values.email}
                onChange={handleChange}
                allowClear
              />
              {errors.email && touched.email && <span className="text-[12px] text-red-500">{errors.email}</span>}
            </div>
            <label className="font-medium max-md:pt-[10px]">Role</label>
            <div className="col-span-3">
              <Dropdown
                mode="tags"
                id="role"
                disabled={isCreating}
                placeholder="Select role"
                includeEmptyValue={false}
                options={ROLE_EMPLOYEE}
                value={values.role}
                onChange={(value) => handleChange({ target: { id: 'role', value } })}
              />
              {errors.role && touched.role && <span className="text-[12px] text-red-500">{errors.role}</span>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
export default EditEmployee;
