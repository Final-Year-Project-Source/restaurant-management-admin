import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import Image from 'next/image';
import PropTypes from 'prop-types';
import { ButtonHTMLAttributes } from 'react';
import {
  AlipayIcon,
  AmericanPayIcon,
  BeamIcon,
  BeamRefundIcon,
  BlueBeamIcon,
  ReceiptIcon,
  ShopeeIcon,
  SquareIcon,
  TaxInvoiceIcon,
  TelePhoneActiveIcon,
  TelePhoneIcon,
  TelePhoneRefundIcon,
  ThaiQrIcon,
  TrueMoneyIcon,
  WeChatIcon,
} from '../Icons';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  option?: 'EDC' | 'Beam' | 'EDC Refund' | 'Beam Refund' | 'Receipt' | 'Invoice';
  className?: string;
  disabled?: boolean;
  isActive?: boolean;
}

const SettlementButton: React.FC<Props> = ({
  option = 'Beam',
  className,
  isActive,
  disabled = false,
  ...restProps
}) => {
  const { isMobile } = useWindowDimensions();

  const RenderEDCPayment = () => {
    return (
      <div
        className={`min-[1200px]:pl-[71px]  min-[1000px]:pl-[41px] pl-[7%] py-[15px] ${isActive && 'cursor-default'}`}
      >
        <div className="flex flex-row md:space-x-[28px] space-x-[24px] items-center">
          {isActive ? <TelePhoneActiveIcon /> : disabled ? <TelePhoneIcon /> : <TelePhoneIcon />}
          <div className="flex flex-col items-start justify-center">
            <label className={`${isActive ? `text-white` : `text-black-500`} text-left`}>EDC payment</label>
            <label className={`${isActive ? `text-white` : `text-black-500 `} font-open-sans text-[11px] text-left`}>
              Collect payment manually
            </label>
          </div>
          <div className="flex flex-col space-y-[5px]">
            <div className="flex space-x-[5px] items-center justify-start">
              <div className="relative">
                <SquareIcon stroke={!isActive ? '#131c16' : 'rgba(255, 255, 255, 0.20)'} />

                <Image
                  className="top-[8px] left-[3px] absolute z-10"
                  priority
                  src={'/assets/icons/visa.svg'}
                  width={16}
                  height={5}
                  alt="logo"
                />
              </div>

              <div className="relative">
                <SquareIcon stroke={!isActive ? '#131c16' : 'rgba(255, 255, 255, 0.20)'} />

                <Image
                  className="top-[5px] left-[3.5px] absolute z-10"
                  priority
                  src={'/assets/icons/master-card.svg'}
                  width={14}
                  height={11}
                  alt="logo"
                />
              </div>

              <ThaiQrIcon />
            </div>
            <div className="flex space-x-[5px] items-center justify-start">
              <AlipayIcon />
              <WeChatIcon
                stroke={!isActive ? '#131c16' : 'rgba(255, 255, 255, 0.20)'}
                fill={!isActive ? '#180806' : 'white'}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RenderBeamCheckout = () => {
    return (
      <div
        className={`min-[1200px]:pl-[71px] min-[1000px]:pl-[41px]  pl-[7%] py-[15px] ${
          isActive && 'cursor-default'
        } min-h-[78px] flex`}
      >
        <div className="flex flex-row md:space-x-[28px] space-x-[20px] items-center">
          {isActive ? <BeamIcon /> : disabled ? <BlueBeamIcon /> : <BlueBeamIcon />}

          <div className="flex flex-col items-start justify-center space-y-[5px]">
            <Image
              priority
              src={`/assets/icons/${
                isActive ? 'beam-checkout' : disabled ? 'blue-beam-checkout' : 'blue-beam-checkout'
              }.svg`}
              width={123}
              height={13}
              alt="beam-checkout"
            />
            <label
              className={`font-open-sans text-[11px] text-left ${
                isActive ? 'text-white' : disabled ? 'text-black-500' : 'text-black-500'
              }`}
            >
              Create payment link
            </label>
          </div>
          <div className="flex flex-col space-y-[5px]">
            <div className="flex space-x-[5px] items-center justify-start">
              <div className="relative">
                <SquareIcon stroke={!isActive ? '#131c16' : 'rgba(255, 255, 255, 0.20)'} />

                <Image
                  className="top-[8px] left-[3px] absolute z-10"
                  priority
                  src={'/assets/icons/visa.svg'}
                  width={16}
                  height={5}
                  alt="logo"
                />
              </div>

              <div className="relative">
                <SquareIcon stroke={!isActive ? '#131c16' : 'rgba(255, 255, 255, 0.20)'} />

                <Image
                  className="top-[5px] left-[3.5px] absolute z-10"
                  priority
                  src={'/assets/icons/master-card.svg'}
                  width={14}
                  height={11}
                  alt="logo"
                />
              </div>
              <AmericanPayIcon />

              {/* <ThaiQrIcon /> */}
            </div>
            {/* <div className="flex space-x-[5px] items-center justify-start">
              <ShopeeIcon />
              <div className="relative">
                <SquareIcon />

                <TrueMoneyIcon className="top-0 left-0 absolute z-10" />
              </div>
              <AlipayIcon />
              <WeChatIcon
                stroke={!isActive ? '#131c16' : 'rgba(255, 255, 255, 0.20)'}
                fill={!isActive ? '#180806' : 'white'}
              />
            </div> */}
          </div>
        </div>
      </div>
    );
  };

  const RenderEDCRefund = () => {
    return (
      <div className="min-[1000px]:pl-[61px] pl-[8%] py-[18px]">
        <div className="flex flex-row space-x-[18px] items-center">
          <TelePhoneRefundIcon />

          <div className="flex flex-col items-start justify-center space-y-[5px]">
            <label className="text-left">Record EDC refund</label>
            <label className="font-open-sans text-[11px] text-left">When you refund a customer using the EDC</label>
          </div>
        </div>
      </div>
    );
  };

  const RenderBeamRefund = () => {
    return (
      <div className="min-[1000px]:pl-[59px] pl-[7%] pt-[22px] pb-[21px]">
        <div className="flex flex-row space-x-[17px] items-center">
          <BeamRefundIcon />

          <div className="flex flex-col items-start justify-center space-y-[5px]">
            <label className="text-left">Refund Beam payment</label>
            <label className="font-open-sans text-[11px] text-left">Initiates a refund in Beam</label>
          </div>
        </div>
      </div>
    );
  };

  const RenderReceipt = () => {
    return (
      <div className="min-[1000px]:pl-[67px] pl-[9%] py-[18px]">
        <div className="flex flex-row space-x-[31px] items-center">
          <ReceiptIcon />

          <div className="flex flex-col items-start justify-center space-y-[5px]">
            <label className="text-left">Get receipt</label>
            <label className="font-open-sans text-[11px] text-left">Generates an image to share</label>
          </div>
        </div>
      </div>
    );
  };

  const RenderInvoice = () => {
    return (
      <div className="min-[1000px]:pl-[64px] pl-[9%] py-[17px]">
        <div className="flex flex-row space-x-[25px] items-center">
          <TaxInvoiceIcon />

          <div className="flex flex-col items-start justify-center space-y-[5px]">
            <label className="text-left">Issue tax invoice</label>
            <label className="font-open-sans text-[11px] text-left">Complete information, print, and sign</label>
          </div>
        </div>
      </div>
    );
  };

  let buttonComponent = null;

  switch (option) {
    case 'EDC':
      buttonComponent = <RenderEDCPayment />;
      break;
    case 'Beam':
      buttonComponent = <RenderBeamCheckout />;
      break;
    case 'EDC Refund':
      buttonComponent = <RenderEDCRefund />;
      break;
    case 'Beam Refund':
      buttonComponent = <RenderBeamRefund />;
      break;
    case 'Receipt':
      buttonComponent = <RenderReceipt />;
      break;
    case 'Invoice':
      buttonComponent = <RenderInvoice />;
      break;
    default:
      buttonComponent = null;
  }

  return (
    <button
      disabled={disabled}
      className={`${className || ''} border-[0.5px] border-black-500 rounded-2xl ${disabled ? 'opacity-50' : ''} ${
        isActive ? 'bg-black-500 ' : 'bg-white'
      } `}
      {...restProps}
    >
      {buttonComponent}
    </button>
  );
};
// ${isMobile ? 'min-w-[356px]' : 'min-w-[435px]'}
export default SettlementButton;
