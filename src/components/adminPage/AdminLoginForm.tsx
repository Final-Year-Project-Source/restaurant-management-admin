'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useLoginMutation } from '@/redux/services/loginApi';
import { isValidEmail } from '@/utils/commonUtils';
import { setOtpURL } from '@/utils/localStorage';
import InputText from '../input/Input';
import InputPasswordText from '../input/InputPassword';
import { Button } from '../button';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';
import { USER_ROLE } from '@/enums';

interface AdminLoginFormProps {
  email: string;
  password: string;
}
const initStateLoginForm: AdminLoginFormProps = {
  email: '',
  password: '',
};

export default function AdminLoginForm() {
  const [loginForm, setLoginForm] = useState<AdminLoginFormProps>({ ...initStateLoginForm });
  const [errors, setErrors] = useState<AdminLoginFormProps>({ ...initStateLoginForm });
  const [errorLogin, setErrorLogin] = useState<string>('');
  const [login, { isLoading }] = useLoginMutation();
  const [load, setLoad] = useState<boolean>(false);
  const router = useRouter();

  const validateFormInput = (field: keyof AdminLoginFormProps, value: string) => {
    if (field === 'password') {
      return value.length < 1 ? 'Please enter a password' : '';
    }
    if (value.length < 1) return `Please enter an email`;

    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AdminLoginFormProps) => {
    const { value } = e.target;

    setLoginForm({
      ...loginForm,
      [field]: value,
    });
    setErrors({
      ...errors,
      [field]: validateFormInput(field, value),
    });
  };
  const handleSubmit = () => {
    try {
      if (!isValidEmail(loginForm.email?.trim())) {
        setErrors({
          ...errors,
          email: 'Please enter a valid email',
        });
        return;
      }
      setErrors({
        ...errors,
        email: validateFormInput('email', loginForm.email?.trim().toLowerCase()),
        password: validateFormInput('password', loginForm.password?.trim()),
      });
      const data = {
        email: loginForm.email?.trim().toLowerCase(),
        password: loginForm.password?.trim(),
      };

      if (!errors.email && !errors.password && data.email && data.password) {
        setLoad(true);
        login({ data })
          .unwrap()
          .then((res) => {
            const user = res?.user;
            const role = res?.user?.role;
            const tokens = res?.tokens;

            if (role === USER_ROLE.USER) {
              return toast.error('You do not have permission to access this page');
            }

            toast.success('Logged in successfully');

            signIn('credentials', {
              email: user.email,
              access_token: tokens?.access?.token,
              access_expires: tokens?.access?.expires,
              refresh_token: tokens?.refresh?.token,
              refresh_expires: tokens?.refresh?.expires,
              redirect: false,
            });
            if (role === USER_ROLE.ADMINISTRATOR) router.push('/employees');
            else router.push('/bills');
          })
          .catch((error) => {
            setLoad(false);
            setErrorLogin(error?.data?.message);
          });
      }
    } catch (error: any) {
      setLoad(false);

      setErrorLogin(error.message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // const { data: session } = useSession();
  // if (session?.user.role === 'Administrator') router.push('/employees');
  // if (session?.user.role === 'STAFF') router.push('/orders');

  return (
    <div className="w-full sm:max-w-xl p-10 space-y-[5px] ">
      <div>
        <div className="font-medium text-[16px] mb-1 text-black-500 "> Email </div>
        <div>
          <InputText disabled={isLoading || load} onChange={(e) => handleInputChange(e, 'email')} placeholder="Email" />
        </div>
        {errors.email ? <p className="text-red-400 text-[14px]">{errors.email}</p> : <p className="h-[21px]"></p>}
      </div>
      <div>
        <div className="font-medium text-[16px] mb-1 text-black-500 ">Password </div>
        <div>
          <InputPasswordText
            onKeyDown={handleKeyDown}
            onChange={(e) => handleInputChange(e, 'password')}
            placeholder="Password"
            disabled={isLoading || load}
          />
        </div>
        {errorLogin ? (
          <p className="text-red-400 text-[14px]">{errorLogin}</p>
        ) : errors.password ? (
          <p className="text-red-400 text-[14px]">{errors.password}</p>
        ) : (
          <p className="h-[21px]"></p>
        )}
      </div>
      <div>
        <Button variant="secondary" disabled={isLoading || load} onClick={handleSubmit}>
          Login
        </Button>
      </div>
      {(isLoading || load) && <LoadingIndicator />}
    </div>
  );
}
