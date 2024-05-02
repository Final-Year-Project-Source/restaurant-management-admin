'use client';
import Button from '@/components/adminPage/Button';
import InputText from '@/components/adminPage/Input';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { capitalize } from 'lodash';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'react-toastify';
import './account.scss';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useChangePasswordMutation } from '@/redux/services/employeeApi';
import InputPasswordText from '@/components/input/InputPassword';

const schema = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password')
    .required('Missing new password'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Confirm password must match new password')
    .nullable()
    .notOneOf([null], 'Please confirm your password')
    .required('Please confirm your password'),
  currentPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('Missing current password'),
});

export default function Modifier() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const { isMobile } = useWindowDimensions();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmNewPassword: '',
      currentPassword: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      changePassword({
        email: session?.user.email || '',
        passwordCurrent: values.currentPassword,
        passwordNew: values.newPassword,
      })
        .unwrap()
        .then(() => {
          resetForm();
          toast.success('Changed password successfully');
        })
        .catch((error) => toast.error(error?.data?.message));
    },
  });
  const { errors, touched, values, handleChange, handleSubmit, resetForm } = formik;

  return (
    <div className="flex flex-col md:space-y-[30px] md:max-w-[594px] md:h-fit h-full bg-white rounded-2xl md:p-[25px] p-5">
      <div className="flex items-center justify-end">
        {!isMobile && (
          <Button
            className="w-[159px]"
            type="button"
            variant="secondary"
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
          >
            Sign out
          </Button>
        )}
      </div>
      <form className="flex flex-col h-full" onSubmit={handleSubmit}>
        <div className="flex gap-2 mb-[10px] items-center justify-center">
          {
            <div
              className={`grid grid-flow-row gap-y-[10px] gap-x-[20px] justify-center items-center w-full  ${
                isMobile ? 'grid-cols-1' : 'grid-cols-4'
              }`}
            >
              <label className="font-medium">Name</label>
              <div className="col-span-3 account-disable-input">
                <InputText id="name" placeholder="Name" disabled value={capitalize(user?.name) || ''} />
              </div>
              <label className="font-medium">Email</label>
              <div className="col-span-3 account-disable-input">
                <InputText type="text" id="email" disabled placeholder="Email" value={user?.email || ''} />
              </div>
              <label className={`font-medium ${!isMobile && ` place-self-start mt-[10px] `}`}>Change password</label>
              <div className="col-span-3 space-y-[10px]">
                <div>
                  <InputPasswordText
                    type="text"
                    id="newPassword"
                    disabled={isChangingPassword}
                    placeholder="New password"
                    value={values.newPassword}
                    onChange={handleChange}
                  />
                  {errors.newPassword && touched.newPassword && (
                    <span className="text-[12px] text-red-500">{errors.newPassword}</span>
                  )}
                </div>
                <div>
                  <InputPasswordText
                    type="text"
                    id="confirmNewPassword"
                    disabled={isChangingPassword}
                    value={values.confirmNewPassword}
                    placeholder="Confirm new password"
                    onChange={handleChange}
                  />
                  {errors.confirmNewPassword && touched.confirmNewPassword && (
                    <span className="text-[12px] text-red-500">{errors.confirmNewPassword}</span>
                  )}
                </div>
                <div>
                  <InputPasswordText
                    type="text"
                    id="currentPassword"
                    disabled={isChangingPassword}
                    placeholder="Current password"
                    value={values.currentPassword}
                    onChange={handleChange}
                  />
                  {errors.currentPassword && touched.currentPassword && (
                    <span className="text-[12px] text-red-500">{errors.currentPassword}</span>
                  )}
                </div>
                <Button className="md:w-[235px] w-full" type="submit" variant="primary" disabled={isChangingPassword}>
                  Change password
                </Button>
              </div>
            </div>
          }
        </div>
        {isMobile && (
          <Button
            className="mt-auto min-h-[61px]"
            variant="secondary"
            type="button"
            disabled={isChangingPassword}
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
          >
            Sign out
          </Button>
        )}
      </form>
    </div>
  );
}
