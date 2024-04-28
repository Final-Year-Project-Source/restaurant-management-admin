'use client';
import React from 'react';
import { Input, ConfigProvider } from 'antd';
import { open_sans } from '@/utils/fontUtils';
import './input.scss';
interface InputTextProps extends React.ComponentProps<typeof Input> {
  valuePlaceholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputText: React.FC<InputTextProps> = ({ valuePlaceholder, ...restProps }) => {
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
      {/* <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /> */}
      <Input className={open_sans.className} placeholder={valuePlaceholder} {...restProps} />
    </ConfigProvider>
  );
};
3;
export default InputText;
