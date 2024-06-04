'use client';
import Button from '@/components/adminPage/Button';
import InputText from '@/components/adminPage/Input';
import CustomizedDrawer from '@/components/drawer';
import Dropdown from '@/components/dropdown/Dropdown';
import { ArrowLeftIcon1 } from '@/components/Icons';
import CustomizedModal from '@/components/modal';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import {
  useDeleteUserMutation,
  useGetSingleUserQuery,
  useReset2FAMutation,
  useResetPasswordMutation,
  useUpdateEmployeeMutation,
} from '@/redux/services/employeeApi';
import { FOOTER_HEIGHT_SAVE, HEADER_LAYOUT, PADDING_TOP_TO_SCROLL, ROLE_EMPLOYEE } from '@/utils/constants';
import { Skeleton } from 'antd';
import { useFormik } from 'formik';
import { isEqual, startCase } from 'lodash';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import '../employees.scss';

export interface UserType {
  id: string;
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
  const { isMobile, width: screenWidth, height } = useWindowDimensions();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollBottom } = useScrollbarState(bodyRef);
  const { data: session } = useSession();
  const access_token = session?.user?.access_token || '';

  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;
  const { data: singleUser, isFetching } = useGetSingleUserQuery({ access_token: access_token, id: id }, { skip: !id });
  const user = singleUser?.data as UserType;
  const [deleteUser, { isLoading: isDeleteLoading }] = useDeleteUserMutation();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  const handleDeleteOk = async () => {
    deleteUser({ access_token, id })
      .unwrap()
      .then(() => {
        setIsModalDeleteOpen(false);
        router.push('/employees');
      })
      .catch((rejectedValueOrSerializedError) => {
        setIsModalDeleteOpen(false);
        toast.error(`Delete user failed: ${rejectedValueOrSerializedError.data?.message}`);
      });
  };
  // const handleOkReset2FA = async () => {
  //   reset2FA({ id })
  //     .unwrap()
  //     .then(() => {})
  //     .catch((rejectedValueOrSerializedError) => {
  //       toast.error(`Reset 2FA failed: ${rejectedValueOrSerializedError.data.message}`);
  //     });
  // };

  const handleOkResetPassword = async () => {
    resetPassword({ id, access_token })
      .unwrap()
      .then((res) => toast.success(res?.data?.messages))
      .catch((rejectedValueOrSerializedError) => {
        toast.error(` ${rejectedValueOrSerializedError.data.message}`);
      });
  };
  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const dataUpdate = {
        name: values.name.trim().toLowerCase(),
        email: values.email.trim().toLowerCase(),
        role: values.role,
      };
      updateEmployee({ access_token, id: user?.id, data: dataUpdate })
        .unwrap()
        .then(() => {})
        .catch((error) => toast.error(error?.data?.message));
    },
  });
  const { errors, touched, values, handleChange, handleSubmit, resetForm } = formik;

  useEffect(() => {
    resetForm({
      values: {
        name: user?.name,
        email: user?.email,
        role: user?.role,
      },
    });
  }, [user]);

  const isDisabled = useMemo(() => {
    if (!values || !user) return true;

    const isNameEqual = isEqual(values.name?.trim().toLowerCase(), user.name?.trim().toLowerCase());
    const isRoleEqual = isEqual(values.role?.toLowerCase(), user.role?.toLowerCase());
    const isEmailEqual = isEqual(values.email?.trim().toLowerCase(), user.email?.trim().toLowerCase());

    return !values.name || !values.email || !values.role || (isNameEqual && isRoleEqual && isEmailEqual);
  }, [values, user]);

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
            disabled={isFetching || isDeleteLoading || isUpdating || isResettingPassword}
            type="button"
            onClick={() => router.push('/employees')}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={() => setIsModalDeleteOpen(true)}
            variant="primary"
            disabled={isFetching || isDeleteLoading || isUpdating || isResettingPassword}
          >
            Delete
          </Button>
          <div
            className={`${
              scrollBottom > PADDING_TOP_TO_SCROLL && isMobile ? 'shadow-medium-top' : ''
            } z-10  md:h-[50px] h-[101px] max-md:px-[20px] absolute md:top-[25px] md:right-[25px] right-1/2 max-md:transform max-md:translate-x-1/2 bottom-0 md:min-w-[136px] w-full md:w-auto max-md:py-5 max-md:bg-white`}
          >
            <Button
              className="w-full max-md:!max-h-[61px] h-[61px]"
              type="submit"
              variant="secondary"
              disabled={isFetching || isDeleteLoading || isUpdating || isResettingPassword || isDisabled}
            >
              Save
            </Button>
          </div>
        </div>
        <div className="pt-[30px] md:pb-[30px] pb-[10px] md:px-[25px] max-md:px-5 flex flex-col space-y-4 items-center justify-center">
          <div
            className={`grid grid-flow-row space-y-[10px] justify-center items-center w-full  ${
              isMobile ? 'grid-cols-1' : 'grid-cols-4'
            }`}
          >
            <label className="font-medium md:pt-[12px]">Employee name</label>
            <div className="col-span-3">
              {isFetching ? (
                <Skeleton.Input active block />
              ) : (
                <div>
                  <InputText
                    id="name"
                    placeholder="Name"
                    disabled={isUpdating || isResettingPassword || isDeleteLoading}
                    value={values.name}
                    onChange={handleChange}
                    allowClear
                  />
                  {errors.name && touched.name && <span className="text-[12px] text-red-500">{errors.name}</span>}
                </div>
              )}
            </div>
            <label className="font-medium max-md:pt-[10px]">Email</label>
            <div className="col-span-3">
              {isFetching ? (
                <Skeleton.Input active block />
              ) : (
                <div>
                  <InputText
                    type="text"
                    id="email"
                    disabled={isUpdating || isResettingPassword || isDeleteLoading}
                    placeholder="Email"
                    value={values.email}
                    onChange={handleChange}
                    allowClear
                  />
                  {errors.email && touched.email && <span className="text-[12px] text-red-500">{errors.email}</span>}
                </div>
              )}
            </div>
            <label className="font-medium max-md:pt-[10px]">Role</label>
            <div className="col-span-3">
              {isFetching ? (
                <Skeleton.Input active block />
              ) : (
                <Dropdown
                  mode="tags"
                  id="role"
                  disabled={isUpdating || isResettingPassword || isDeleteLoading}
                  placeholder="Select role"
                  includeEmptyValue={false}
                  options={ROLE_EMPLOYEE}
                  value={values.role}
                  onChange={(value) => handleChange({ target: { id: 'role', value } })}
                />
              )}
            </div>

            <label className="font-medium">Reset password</label>
            <div className="col-span-3 w-[235px]">
              {/* <Button
                className="w-full"
                type="button"
                onClick={handleOkReset2FA}
                variant="primary"
                disabled={
                  isFetching ||
                  isDeleteLoading ||
                  
                  isUpdating ||
                  isResettingPassword ||
                  !user?.otp_enabled
                }
              >
                Reset 2FA
              </Button> */}
              <Button
                className="w-full mt-[10px]"
                type="button"
                onClick={handleOkResetPassword}
                variant="primary"
                disabled={isFetching || isDeleteLoading || isUpdating || isResettingPassword}
              >
                Reset password
              </Button>
            </div>
          </div>
        </div>
        <CustomizedModal
          className="customized-width"
          open={isModalDeleteOpen && !isMobile}
          title="Confirm deletion"
          onOk={handleDeleteOk}
          okText="Delete"
          onCancel={() => setIsModalDeleteOpen(false)}
        >
          <div className="text-center text-black-400 flex flex-col mb-[30px]">
            <span>Are you sure you want to delete?</span> <span>This cannot be undone.</span>
          </div>
        </CustomizedModal>
        <CustomizedDrawer
          className="bill-drawer"
          type="confirm"
          open={isModalDeleteOpen && isMobile}
          onClose={() => setIsModalDeleteOpen(false)}
          title="Confirm deletion"
          okText="Delete"
          onOk={handleDeleteOk}
          width={screenWidth}
        >
          <div className="text-center text-black-400 flex flex-col">
            <span>Are you sure you want to delete?</span> <span>This cannot be undone.</span>
          </div>
        </CustomizedDrawer>
      </form>
    </div>
  );
};
export default EditEmployee;
