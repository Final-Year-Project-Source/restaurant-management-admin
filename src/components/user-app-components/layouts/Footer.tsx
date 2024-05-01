import { Button } from '@/components/button';
import { CloseOutlinedIcon1 } from '@/components/Icons';
import { FC } from 'react';

export interface FooterProps {
  isShowPrimaryButton?: boolean;
  isShowSecondaryButton?: boolean;
  primaryBtnChildren?: React.ReactNode;
  secondaryBtnChildren?: React.ReactNode;
  disabledPrimary?: boolean;
  disabledSecondary?: boolean;
  onClickPrimaryBtn?: React.MouseEventHandler<HTMLButtonElement>;
  onClickSecondaryBtn?: React.MouseEventHandler<HTMLButtonElement>;
  isTextRequestTaxInvoice?: boolean;
  className?: string;
  isMobile?: boolean;
  onClickBackBtn?: React.MouseEventHandler<HTMLButtonElement>;
  classNameFooter?: string;
}

const Footer: FC<FooterProps> = ({
  isShowPrimaryButton = false,
  primaryBtnChildren,
  secondaryBtnChildren,
  disabledPrimary,
  disabledSecondary,
  onClickPrimaryBtn,
  onClickSecondaryBtn,
  isTextRequestTaxInvoice,
  className,
  isShowSecondaryButton,
  isMobile,
  onClickBackBtn,
  classNameFooter,
}) => {
  return (
    <div className={`${className || ''} w-full md:sticky fixed flex flex-col space-y-3 bottom-0 py-3 z-999`}>
      {isTextRequestTaxInvoice && (
        <div className="text-[14px] text-black-500 text-center mb-2">
          Once you request the tax invoice, a member of our staff will print it off, sign, and hand it to you.
        </div>
      )}
      {isShowPrimaryButton && (
        <Button variant="primary" disabled={disabledPrimary} onClick={onClickPrimaryBtn}>
          {primaryBtnChildren}
        </Button>
      )}
      {isShowSecondaryButton && (
        <div className={`flex justify-between items-center ${classNameFooter}`}>
          <Button
            className="!max-h-[61px]"
            variant="secondary"
            disabled={disabledSecondary}
            onClick={onClickSecondaryBtn}
          >
            {secondaryBtnChildren}
          </Button>
          {isMobile && (
            <div className="cursor-pointer" onClick={onClickBackBtn}>
              <CloseOutlinedIcon1 width={23} height={22} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Footer;
