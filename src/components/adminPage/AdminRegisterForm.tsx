'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useLoginFirstStepMutation } from '@/redux/services/loginApi';
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
  const [loginFirstStep, { isLoading }] = useLoginFirstStepMutation();
  const [load, setLoad] = useState<boolean>(false);
  const router = useRouter();

  const validateFormInput = (field: keyof AdminRegisterFormProps, value: string) => {
    if (field === 'password') {
      return value.length < 1 ? 'Mật khẩu bắt buộc' : '';
    }
    if (field === 'confirmPassword') {
      return value.length < 1 ? 'Xác nhận mật khẩu bắt buộc' : '';
    }
    if (field === 'name') {
      return value.length < 1 ? 'Tên bắt buộc' : '';
    }
    if (value.length < 1) return `Email bắt buộc`;

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
          email: 'Nhập đúng định dạng email',
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
      //           setErrorLogin('Email hoặc mật khẩu không chính xác');
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
        <div className="font-medium text-[16px] mb-1 text-black-500 "> Tên </div>
        <div>
          <InputText disabled={isLoading || load} onChange={(e) => handleInputChange(e, 'name')} placeholder="Tên" />
        </div>
        {errors.name ? <p className="text-red-400 text-[14px]">{errors.name}</p> : <p className="h-[21px]"></p>}
      </div>
      <div>
        <div className="font-medium text-[16px] mb-1 text-black-500 "> Email </div>
        <div>
          <InputText disabled={isLoading || load} onChange={(e) => handleInputChange(e, 'email')} placeholder="Email" />
        </div>
        {errors.email ? <p className="text-red-400 text-[14px]">{errors.email}</p> : <p className="h-[21px]"></p>}
      </div>
      <div>
        <div className="font-medium text-[16px] mb-1 text-black-500 "> Mật khẩu </div>
        <div>
          <InputPasswordText
            onKeyDown={handleKeyDown}
            onChange={(e) => handleInputChange(e, 'password')}
            placeholder="Mật khẩu"
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
        <div className="font-medium text-[16px] mb-1 text-black-500 "> Xác nhận mật khẩu </div>
        <div>
          <InputPasswordText
            onKeyDown={handleKeyDown}
            onChange={(e) => handleInputChange(e, 'confirmPassword')}
            placeholder="Xác nhận mật khẩu"
            disabled={isLoading || load}
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
        <Button variant="secondary" disabled={isLoading || load} onClick={handleSubmit}>
          Đăng ký
        </Button>
      </div>
      {(isLoading || load) && <LoadingIndicator />}
    </div>
  );
}
