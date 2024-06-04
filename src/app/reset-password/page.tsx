'use client';
import React, { useState } from 'react';
import '@/styles/globals.css';
import Button from '@/components/button/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useResetForgotPasswordMutation } from '@/redux/services/loginApi';
import { toast } from 'react-toastify';
import InputPasswordText from '@/components/input/InputPassword';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const [passwordConfirm, setPasswordConfirm] = useState<String>('');
  const [errorNewPassword, setErrorNewPassword] = useState<string>('');
  const [load, setLoad] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [resetForgotPassword, { isLoading }] = useResetForgotPasswordMutation();
  const router = useRouter();
  const resetPasswordToken = searchParams?.get('token');
  const handleInputNewPassword = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPassword(value);
  };
  const handleInputConfirmPassword = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPasswordConfirm(value);
  };
  const handleKeyDownNewPasswordInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitNewPassword();
    }
  };
  const handleSubmitNewPassword = async () => {
    setLoad(true);
    if (!newPassword) {
      setLoad(false);
      return setErrorNewPassword('Please enter new password');
    }
    if (!passwordConfirm) {
      setLoad(false);
      return setErrorNewPassword('Please enter confirm new password');
    }
    if (newPassword !== passwordConfirm) {
      setLoad(false);
      return setErrorNewPassword('New password and confirm new password must be the same');
    }
    if (newPassword.length < 6) {
      setLoad(false);
      setErrorNewPassword('Password must be at least 6 characters');
    } else {
      setErrorNewPassword('');
      const data = {
        password: newPassword,
      };
      resetForgotPassword({ data: data, token: resetPasswordToken || '' })
        .unwrap()
        .then((res) => {
          setLoad(false);
          toast.success('Reset password successfully. Please login again with your new password');
          router.push('/login');
        })
        .catch((err) => {
          setLoad(false);
          setErrorNewPassword(err.data.message);
        });
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col bg-white justify-center items-center w-full sm:max-w-xl space-y-3 p-10 rounded-xl shadow-2xl max-[768px]:m-2">
        <div className="text-[24px] font-bold text-black-500 my-3">Reset password</div>
        <div className="text-[14px] text-black-500 my-5">You need to enter your new password and confirm it below.</div>
        <div className="w-full">
          <div className="text-[14px] font-bold text-black-500 my-3">New password</div>
          <InputPasswordText
            placeholder="New password"
            disabled={isLoading || load}
            onChange={handleInputNewPassword}
          />
        </div>
        <div className="w-full">
          <div className="text-[14px] font-bold text-black-500 my-3">Confirm new password</div>
          <InputPasswordText
            disabled={isLoading || load}
            placeholder="Confirm new password"
            onKeyDown={handleKeyDownNewPasswordInput}
            onChange={handleInputConfirmPassword}
          />
        </div>
        <div className="w-full">
          {errorNewPassword ? (
            <div className="text-red-500 text-[14px]">{errorNewPassword}</div>
          ) : (
            <div className="h-[21px]"></div>
          )}
          <Button onClick={handleSubmitNewPassword} disabled={isLoading || load} variant="secondary" className="mt-2">
            Submit
          </Button>
        </div>
        <div className="text-[14px] text-black-500 italic text-center my-5">
          After setting your new password, you will be redirected to the login page and need to login again with your
          new password.
        </div>
        {(isLoading || load) && <LoadingIndicator />}
      </div>
    </div>
  );
}
