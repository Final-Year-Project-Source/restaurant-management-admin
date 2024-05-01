'use client';
import React, { FC, useRef } from 'react';
import Footer, { FooterProps } from './Footer';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { IconButton } from '@/components/button';
import { ArrowLeftIcon } from '@/components/Icons';
import './layout.scss';

export interface ProductLayoutProps extends FooterProps {
  children?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickBackBtn?: React.MouseEventHandler<HTMLButtonElement>;
  isShowFooter?: boolean;
}

const ProductLayout: FC<ProductLayoutProps> = ({
  children,
  disabledSecondary,
  onClickSecondaryBtn,
  secondaryBtnChildren,
  onClickPrimaryBtn,
  primaryBtnChildren,
  isShowPrimaryButton,
  onClickBackBtn,
  isShowSecondaryButton,
  isShowFooter,
  isMobile,
  className,
}) => {
  const productLayoutRef = useRef(null);
  const { scrollBottom } = useScrollbarState(productLayoutRef);

  return (
    <div className="flex flex-col h-full">
      <div className="w-full max-md:pt-[22px] pl-4 fixed z-10">
        <IconButton icon={<ArrowLeftIcon />} onClick={onClickBackBtn} />
      </div>
      <div ref={productLayoutRef} className="product-layout h-full overflow-y-auto max-h-screen-85">
        {children}
      </div>
      {isShowFooter && (
        <Footer
          className={`pl-6 pr-[32px] ${scrollBottom - 30 > 0 ? 'shadow-medium-top' : ''} ${className}`}
          disabledSecondary={disabledSecondary}
          isShowPrimaryButton={isShowPrimaryButton}
          onClickPrimaryBtn={onClickPrimaryBtn}
          primaryBtnChildren={primaryBtnChildren}
          onClickSecondaryBtn={onClickSecondaryBtn}
          secondaryBtnChildren={secondaryBtnChildren}
          isShowSecondaryButton={isShowSecondaryButton}
          isMobile={isMobile}
          onClickBackBtn={onClickBackBtn}
          classNameFooter="space-x-[30px]"
        />
      )}
    </div>
  );
};

export default ProductLayout;
