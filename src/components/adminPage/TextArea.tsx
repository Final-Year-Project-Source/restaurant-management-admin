'use client';
import { open_sans } from '@/utils/fontUtils';
import { ConfigProvider, Input } from 'antd';
import React, { FC, TextareaHTMLAttributes } from 'react';
import './input.scss';
const { TextArea } = Input;

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value?: string;
  disabled?: boolean;
  placeholder?: string;
}

const TextAreaInput: FC<TextAreaProps> = ({ onChange, value, disabled, placeholder, ...restProps }) => {
  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Input: {
              paddingInline: 15,
              paddingBlock: 10,
              activeBorderColor: 'rgba(19, 28, 22, 0.2)',
              hoverBorderColor: 'rgba(19, 28, 22, 0.2)',
            },
          },
          token: {
            lineHeight: 1.5,
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
        <TextArea
          value={value}
          className={open_sans.className}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoSize={{ minRows: 3, maxRows: 3.1 }}
        />
      </ConfigProvider>
    </>
  );
};

export default TextAreaInput;
