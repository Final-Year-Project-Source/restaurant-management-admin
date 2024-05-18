'use client';
import React, { useState } from 'react';
import { Input, ConfigProvider } from 'antd';
import { SearchIcon } from '@/components/Icons';
import './input.scss';

interface SearchInputProps extends React.ComponentProps<typeof Input> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ ...restProps }) => {
  const [focus, setFocus] = useState(false);
  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            paddingInline: 16,
            paddingBlock: 11,
            activeBorderColor: 'rgba(19, 28, 22, 0.2)',
            hoverBorderColor: 'rgba(19, 28, 22, 0.2)',
          },
        },
        token: {
          lineHeight: 1.5,
          colorText: '#131C16',
          fontSize: 14,
          colorBgContainer: 'transparent',
          colorBorder: 'rgba(19, 28, 22, 0.2)',
          colorPrimary: 'transparent',
          colorPrimaryHover: 'transparent',
          colorPrimaryActive: 'transparent',
          colorTextPlaceholder: 'rgba(0, 0, 0, 0.50)',
          borderRadius: 16,
          fontFamily: 'var(--font-open-sans)',
        },
      }}
    >
      {/* <meta name="viewport" content="width=device-width, initial-scale=0.8, maximum-scale=0.8, user-scalable=no" /> */}
      <Input
        className={`search-input-container--${focus ? 'focus' : ''} search-customized`}
        placeholder="Search here..."
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        prefix={
          <div className="mr-[8px]">
            <SearchIcon />
          </div>
        }
        {...restProps}
      />
    </ConfigProvider>
  );
};

export default SearchInput;
