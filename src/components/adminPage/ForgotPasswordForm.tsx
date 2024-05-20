'use client';
import React, { useState, useEffect } from 'react';
import '@/styles/globals.css';
import Button from '@/components/button/Button';
import { isValidEmail } from '@/utils/commonUtils';
import { useSendMailResetPasswordMutation } from '@/redux/services/loginApi';
import { useRouter } from 'next/navigation';
import LoadingIndicator from '../LoadingIndicator';
import InputText from './Input';
export default function ForgotPasswordForm() {
  const [load, setLoad] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [errorEmail, setErrorEmail] = useState<string>('');
  const [sendMail, { isLoading: isSending }] = useSendMailResetPasswordMutation();
  const [sent, setSent] = useState<boolean>(false);
  const [resendTimeout, setResendTimeout] = useState<number>(30);
  const router = useRouter();
  const handleEmailInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEmail(value);
  };
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitEmail();
    }
  };
  const handleSubmitEmail = async () => {
    setLoad(true);
    if (!email) {
      setLoad(false);
      return setErrorEmail('Please enter your email');
    }
    if (!isValidEmail(email)) {
      setLoad(false);
      return setErrorEmail('Please enter a valid email ');
    }
    setErrorEmail('');
    const data = {
      email,
    };
    sendMail({ data })
      .unwrap()
      .then((res) => {
        setLoad(false);
        setResendTimeout(30);
        setSent(true);
      })
      .catch((err) => {
        setErrorEmail(err.data.message);
        setLoad(false);
      });
  };
  useEffect(() => {
    if (resendTimeout > 0 && sent) {
      const timer = setTimeout(() => {
        setResendTimeout((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimeout, sent]);
  const sendEmailForm = (
    <div className="flex flex-col bg-white justify-center items-center w-full sm:max-w-xl space-y-3 p-10 rounded-xl shadow-2xl max-[768px]:m-2">
      <div className="text-[24px] font-bold text-black-500 my-3">Forgot Password</div>
      <div className="text-[14px] text-black-500 my-5">
        To reset your password, please provide the email address associated with your account.
      </div>
      <div className="w-full">
        <div className="text-[14px] font-bold text-black-500 my-3">Email</div>
        <InputText
          placeholder="Email"
          disabled={load || isSending}
          onChange={handleEmailInput}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="w-full">
        {errorEmail ? <div className="text-red-500 text-[14px]">{errorEmail}</div> : <div className="h-[10px]"></div>}
        <Button onClick={handleSubmitEmail} disabled={load || isSending} variant="secondary" className="mt-1">
          Submit
        </Button>
      </div>
      <div
        className={`text-[14px] text-right text-black-500 cursor-pointer w-full italic hover:underline ${
          isSending && `pointer-events-none`
        }`}
        onClick={() => router.push('/login')}
      >
        Return to login page
      </div>
      {load && <LoadingIndicator />}
    </div>
  );
  const EmailSentContent = (
    <div className="flex flex-col bg-white justify-center items-center w-full sm:max-w-xl space-y-3 p-10 rounded-xl shadow-2xl max-[768px]:m-2">
      <div className="text-[24px] font-bold text-black-500 my-3">Reset Password</div>
      <div className="text-[14px] text-black-500 my-5">
        A link to reset your password has been sent to your email address. Please check your email.
      </div>
      <div className="text-[14px] text-black-500 w-full">
        Didnt receive the email?
        {resendTimeout > 0 ? (
          <span className="text-gray-500"> Resend in {resendTimeout} seconds</span>
        ) : (
          <span
            className={`cursor-pointer hover:underline italic ${isSending && `pointer-events-none`}`}
            onClick={handleSubmitEmail}
          >
            {' '}
            Resend{' '}
          </span>
        )}
      </div>
      <div
        className={`text-[14px] text-black-500 hover:underline cursor-pointer w-full italic ${
          isSending && `pointer-events-none`
        }`}
        onClick={() => setSent(false)}
      >
        Change to another email address
      </div>
      <div
        className={`text-[14px] text-black-500 hover:underline cursor-pointer w-full italic ${
          isSending && `pointer-events-none`
        }`}
        onClick={() => router.push('/login')}
      >
        Return to login page
      </div>
      {load && <LoadingIndicator />}
    </div>
  );
  return <>{sent ? EmailSentContent : sendEmailForm}</>;
}
