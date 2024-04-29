import { Modal } from 'antd';
import { FC } from 'react';
import LoadingIndicator from '../LoadingIndicator';
import './customizedModal.scss';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { Button } from '../button';
import { CloseModal } from '../Icons';
interface PropsModal {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  okText?: string;
  loading?: boolean;
  children: React.ReactNode;
  title: string;
  className?: string;
  width?: number;
  disableOkButton?: boolean;
}

const CustomizedModal: FC<PropsModal> = ({
  open,
  onOk,
  onCancel,
  okText,
  loading,
  children,
  title,
  className,
  width,
  disableOkButton,
}) => {
  return (
    <Modal
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      className={`customized-modal ${className || ''}`}
      confirmLoading
      centered
      closeIcon={null}
      width={width}
      footer={[
        <Button
          className="max-h-[61px]"
          type="submit"
          disabled={loading || disableOkButton}
          key="ok"
          variant="secondary"
          onClick={onOk}
        >
          {okText || 'Confirm'}
        </Button>,
      ]}
    >
      <div className="flex w-full justify-center text-[20px] font-medium mb-[30px] text-black-500"> {title} </div>

      <div
        className="absolute top-[28px] right-[31px] cursor-pointer hover:bg-black-100 p-[8px] rounded-full"
        onClick={onCancel}
      >
        <CloseModal />
      </div>
      {children}
      {loading && <LoadingIndicator />}
    </Modal>
  );
};

export default CustomizedModal;
