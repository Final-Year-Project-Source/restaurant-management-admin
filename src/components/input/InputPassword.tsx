'use client';
import React, { useState } from 'react';
import { Input, ConfigProvider } from 'antd';
import { open_sans } from '@/utils/fontUtils';
import './input.scss';
import './inputPassword.scss';

import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
interface InputTextProps extends React.ComponentProps<typeof Input> {
  valuePlaceholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  passwordVisible?: boolean;
  setPasswordVisible?: (value: boolean) => void;
}

const InputPasswordText: React.FC<InputTextProps> = ({
  valuePlaceholder,
  passwordVisible,
  setPasswordVisible,
  ...restProps
}) => {
  const [focus, setFocus] = useState(false);

  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            paddingInline: 15,
            paddingBlock: 10,
            activeBorderColor: 'rgba(19, 28, 22, 0.2)',
            hoverBorderColor: 'rgba(19, 28, 22, 0.2)',
            borderRadius: 16,
            activeBg: 'transparent',
          },
        },
        token: {
          lineHeight: 1.85,
          colorText: '#131C16',
          fontFamily: `${open_sans}, sans-serif`,
          fontSize: 14,
          colorBgContainer: 'transparent',
          colorBorder: 'rgba(19, 28, 22, 0.2)',
          colorPrimary: 'transparent',
          colorPrimaryHover: 'transparent',
          colorPrimaryActive: 'transparent',
          colorTextPlaceholder: 'rgba(0, 0, 0, 0.50)',
          borderRadius: 16,
        },
      }}
    >
      <Input.Password
        className={`input-password ${focus ? '--focus' : ''}`}
        autoComplete="off"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
        placeholder={valuePlaceholder}
        {...restProps}
      />
    </ConfigProvider>
  );
};

export default InputPasswordText;
