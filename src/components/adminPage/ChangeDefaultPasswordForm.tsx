'use client';
import React, { useState, useEffect } from 'react';
import '@/styles/globals.css';
import Button from '@/components/button/Button';
import { useRouter } from 'next/navigation';
import LoadingIndicator from '../LoadingIndicator';
import { useChangeDefaultPasswordMutation } from '@/redux/services/loginApi';
import InputPasswordText from '../input/InputPassword';
export default function ChangeDefaultPasswordForm({ verifyToken }: { verifyToken: string }) {
  const [passwordConfirm, setPasswordConfirm] = useState<String>('');
  const [errorNewPassword, setErrorNewPassword] = useState<string>('');
  const [load, setLoad] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [changeDefaultPassword, { isLoading }] = useChangeDefaultPasswordMutation();
  const router = useRouter();

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
      changeDefaultPassword({ newPassword: newPassword, verifyToken: verifyToken })
        .unwrap()
        .then((res) => {
          if (res.message === 'Successful') {
            return router.replace('/login');
          } else {
            setLoad(false);
            setErrorNewPassword(res.message);
          }
        })
        .catch((err) => {
          setLoad(false);
          setErrorNewPassword(err.data.message);
        });
    }
  };

  return (
    <div className="flex flex-col bg-white justify-center items-center w-full sm:max-w-xl space-y-3 p-10 rounded-xl shadow-2xl">
      <div className="text-[24px] font-bold text-black-500 my-3">Change default password</div>
      <div className="text-[14px] text-black-500 my-5">
        You need to change your default password before using the system.
      </div>
      <div className="w-full">
        <div className="text-[14px] font-bold text-black-500 my-3">New password</div>
        <InputPasswordText placeholder="New password" disabled={isLoading || load} onChange={handleInputNewPassword} />
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
        After changing your default password, you will be redirected to the login page and need to login again with your
        new password.
      </div>
      {(isLoading || load) && <LoadingIndicator />}
    </div>
  );
}
