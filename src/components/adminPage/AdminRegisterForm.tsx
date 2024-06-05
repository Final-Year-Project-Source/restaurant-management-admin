'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingIndicator from '@/components/loadingIndicator';
import { isValidEmail } from '@/utils/commonUtils';
import { setOtpURL } from '@/utils/localStorage';
import InputText from '../input/Input';
import InputPasswordText from '../input/InputPassword';
import { Button } from '../button';

interface AdminRegisterFormProps {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}
const initStateRegisterForm: AdminRegisterFormProps = {
  email: '',
  password: '',
  name: '',
  confirmPassword: '',
};

export default function AdminRegisterForm() {
  const [registerForm, setRegisterForm] = useState<AdminRegisterFormProps>({ ...initStateRegisterForm });
  const [errors, setErrors] = useState<AdminRegisterFormProps>({ ...initStateRegisterForm });
  const [errorLogin, setErrorLogin] = useState<string>('');
  const [load, setLoad] = useState<boolean>(false);
  const router = useRouter();

  const validateFormInput = (field: keyof AdminRegisterFormProps, value: string) => {
    if (field === 'password') {
      return value.length < 1 ? 'Please enter a password' : '';
    }
    if (field === 'confirmPassword') {
      return value.length < 1 ? 'Please confirm password' : '';
    }
    if (field === 'name') {
      return value.length < 1 ? 'Please enter name' : '';
    }
    if (value.length < 1) return `Please enter an email`;

    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AdminRegisterFormProps) => {
    const { value } = e.target;

    setRegisterForm({
      ...registerForm,
      [field]: value,
    });
    setErrors({
      ...errors,
      [field]: validateFormInput(field, value),
    });
  };
  const handleSubmit = () => {
    try {
      if (!isValidEmail(registerForm.email?.trim())) {
        setErrors({
          ...errors,
          email: 'Please enter a valid email',
        });
        return;
      }
      setErrors({
        ...errors,
        email: validateFormInput('email', registerForm.email?.trim().toLowerCase()),
        password: validateFormInput('password', registerForm.password?.trim()),
      });
      const data = {
        email: registerForm.email?.trim().toLowerCase(),
        password: registerForm.password?.trim(),
        name: registerForm.name?.trim(),
        confirmPassword: registerForm?.confirmPassword.trim(),
      };

      //   if (!errors.email && !errors.password && data.email && data.password) {
      //     setLoad(true);
      //     loginFirstStep({ data })
      //       .unwrap()
      //       .then((response) => {
      //         if (response.message !== 'Successful') {
      //           setLoad(false);
      //           setErrorLogin('Email or password is incorrect');
      //           return;
      //         }
      //         const otp_auth_url = response.data.otp_auth_url?.toString();
      //         if (otp_auth_url) {
      //           setOtpURL(otp_auth_url);
      //         }
      //         router.push(`/2fa`);
      //       })
      //       .catch((error) => {
      //         setLoad(false);
      //         setErrorLogin(error.data.message);
      //       });
      //   }
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
        <div className="font-medium text-[16px] mb-1 text-black-500 "> Name </div>
        <div>
          <InputText disabled={load} onChange={(e) => handleInputChange(e, 'name')} placeholder="Name" />
        </div>
        {errors.name ? <p className="text-red-400 text-[14px]">{errors.name}</p> : <p className="h-[21px]"></p>}
      </div>
      <div>
        <div className="font-medium text-[16px] mb-1 text-black-500 "> Email </div>
        <div>
          <InputText disabled={load} onChange={(e) => handleInputChange(e, 'email')} placeholder="Email" />
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
            disabled={load}
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
        <div className="font-medium text-[16px] mb-1 text-black-500 "> Confirm password </div>
        <div>
          <InputPasswordText
            onKeyDown={handleKeyDown}
            onChange={(e) => handleInputChange(e, 'confirmPassword')}
            placeholder="Confirm password"
            disabled={load}
          />
        </div>
        {errorLogin ? (
          <p className="text-red-400 text-[14px]">{errorLogin}</p>
        ) : errors.confirmPassword ? (
          <p className="text-red-400 text-[14px]">{errors.confirmPassword}</p>
        ) : (
          <p className="h-[21px]"></p>
        )}
      </div>
      <div>
        <Button variant="secondary" disabled={load} onClick={handleSubmit}>
          Register
        </Button>
      </div>
      {load && <LoadingIndicator />}
    </div>
  );
}
