'use client';
import React, { FC, useEffect, useMemo, useRef } from 'react';
import Footer, { FooterProps } from './Footer';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { IconButton } from '@/components/button';
import { ArrowLeftIcon, DownloadIcon } from '@/components/Icons';

export interface OtherLayoutProps extends FooterProps {
  children?: React.ReactNode;
  onClickBackBtn?: React.MouseEventHandler<HTMLButtonElement>;
  onClickDownBtn?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  isShowBackBtn?: boolean;
  isTextRequestTaxInvoice?: boolean;
  disabledBackBtn?: boolean;
  isShowFooter?: boolean;
  isMobile?: boolean;
}

const OtherLayout: FC<OtherLayoutProps> = ({
  isShowBackBtn = true,
  title,
  isTextRequestTaxInvoice,
  children,
  disabledPrimary,
  disabledSecondary,
  onClickSecondaryBtn,
  secondaryBtnChildren,
  onClickPrimaryBtn,
  primaryBtnChildren,
  isShowPrimaryButton,
  onClickBackBtn,
  onClickDownBtn,
  disabledBackBtn,
  isShowSecondaryButton,
  isShowFooter = true,
  isMobile,
  className,
}) => {
  const otherLayoutBodyRef = useRef(null);
  const { scrollTop, scrollBottom } = useScrollbarState(otherLayoutBodyRef);
  const headerFooterHeight = useMemo(() => {
    if (!isShowPrimaryButton) {
      return isTextRequestTaxInvoice ? '211px' : '170px';
    }
    return '243px';
  }, [isShowPrimaryButton, isTextRequestTaxInvoice]);
  // padding top: 22px (on all pages of Other layout)
  return (
    <div className="flex flex-col h-full">
      <div
        className={`${
          scrollTop - 13 > 0 ? 'shadow-medium-bottom' : ''
        } relative w-full max-md:pt-[22px] pb-[15px] flex flex-row items-center ${
          isShowBackBtn ? 'justify-start pl-4' : 'justify-end pr-4'
        }`}
      >
        {isShowBackBtn && <IconButton icon={<ArrowLeftIcon />} disabled={disabledBackBtn} onClick={onClickBackBtn} />}
        <span className="pl-2 w-[calc(100%-8rem)] absolute top-[40%] md:top-[16%] right-1/2 transform translate-x-1/2 text-center text-xl font-medium text-black-500 whitespace-nowrap">
          {title}
        </span>
      </div>
      <div
        ref={otherLayoutBodyRef}
        className={`overflow-y-auto max-h-screen-${headerFooterHeight} other-layout md:h-full md:relative`}
      >
        {children}
      </div>
      {isShowFooter && (
        <Footer
          className={`pl-[26px] pr-[32px] ${scrollBottom - 40 > 0 ? 'shadow-medium-top' : ''} ${className || ''}`}
          disabledPrimary={disabledPrimary}
          disabledSecondary={disabledSecondary}
          isTextRequestTaxInvoice={isTextRequestTaxInvoice}
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

export default OtherLayout;
