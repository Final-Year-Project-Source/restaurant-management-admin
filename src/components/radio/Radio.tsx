// components/Radio.tsx
'use client';
import React from 'react';
import { Radio, ConfigProvider } from 'antd';
import { open_sans } from '@/utils/fontUtils';
interface RadioProps {
  value: string;
}

const CustomRadio: React.FC<RadioProps> = ({ value }) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Radio: {
            colorPrimary: '#131C16',
            colorBorder: 'RGBA(19, 28, 22, 0.2)',
            radioSize: 20,
            dotSize: 8,
            colorBgContainer: 'transparent',
          },
        },
        token: {
          paddingXS: 0,
        },
      }}
    >
      <Radio value={value}>
        <div className={`ml-[11px] text-[14px] ${open_sans.className}`}>{`${value}`}</div>
      </Radio>
    </ConfigProvider>
  );
};

export default CustomRadio;
