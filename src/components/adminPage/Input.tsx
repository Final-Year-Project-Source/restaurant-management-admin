'use client';
import React from 'react';
import { Input, ConfigProvider, Skeleton } from 'antd';
import { open_sans } from '@/utils/fontUtils';
import './input.scss';
interface InputTextProps extends React.ComponentProps<typeof Input> {
  valuePlaceholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  height?: number;
  isLoading?: boolean;
  paddingX?: number;
  inputTaxInvoice?: boolean;
}

const InputText: React.FC<InputTextProps> = ({
  valuePlaceholder,
  inputTaxInvoice = false,
  label,
  height = 38,
  isLoading,
  ...restProps
}) => {
  return (
    <div className={`flex flex-col space-y-2 w-full ${inputTaxInvoice ? 'input-tax-invoice' : 'input-admin-page'}`}>
      {label && <label className="text-md font-medium text-black-500">{label}</label>}
      <ConfigProvider
        theme={{
          components: {
            Input: {
              paddingInline: 15,
              paddingBlock: 10,
              activeBorderColor: 'rgba(19, 28, 22, 0.2)',
              borderRadius: 16,
            },
          },
          token: {
            colorText: '#131C16',
            // fontFamily: `${open_sans}, sans-serif`,
            fontSize: 13,
            colorBgContainer: 'transparent',
            colorBorder: 'rgba(19, 28, 22, 0.2)',
            colorPrimary: 'transparent',
            colorTextPlaceholder: 'rgba(0, 0, 0, 0.50)',
          },
        }}
      >
        {isLoading ? (
          <Skeleton.Input active />
        ) : (
          <Input
            style={{ height: height }}
            className={`${open_sans.className} truncate`}
            placeholder={valuePlaceholder}
            {...restProps}
            allowClear={false}
          />
        )}
      </ConfigProvider>
    </div>
  );
};
3;
export default InputText;
