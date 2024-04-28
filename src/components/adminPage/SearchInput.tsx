'use client';
import { CloseOutlinedIcon, CloseOutlinedIcon1, SearchIcon1 } from '@/components/Icons';
import { ConfigProvider, Input } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import './input.scss';
interface SearchInputProps extends React.ComponentProps<typeof Input> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleSearch?: () => void;
  isOpenSearch?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ isOpenSearch, toggleSearch, ...restProps }) => {
  const [focus, setFocus] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    (inputRef?.current as any)?.focus();
  }, [isOpenSearch]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            paddingInline: 9,
            paddingBlock: 7,
            activeBorderColor: 'rgba(19, 28, 22, 0.2)',
            hoverBorderColor: 'rgba(19, 28, 22, 0.8)',
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
      <div className="search-container relative w-full flex items-center justify-end !h-[38px]">
        <Input
          ref={inputRef}
          allowClear={{ clearIcon: <CloseOutlinedIcon1 /> }}
          className={`absolute search-input-container ${focus ? '--focus' : ''}`}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          autoFocus={!!isOpenSearch}
          placeholder="Search menu"
          {...restProps}
        />
        <SearchIcon1 className="absolute right-[9px] bottom-[7px] z-50 cursor-pointer" onClick={toggleSearch} />
      </div>
    </ConfigProvider>
  );
};

export default SearchInput;
