import { Drawer, DrawerProps } from 'antd';
import React, { FC } from 'react';
import { Button } from '../button';
import { CloseOutlinedIcon1 } from '../Icons';
import LoadingIndicator from '../LoadingIndicator';
import './drawer.scss';
interface PropsDrawer extends DrawerProps {
  open: boolean;
  onOk: () => void;
  onClose?: () => void;
  okText?: string | React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
  title?: string;
  className?: string;
  width?: number;
  isMobile?: boolean;
  classNameFooter?: string;
  type?: 'create' | 'confirm';
  disableOkButton?: boolean;
}

const CustomizedDrawer: FC<PropsDrawer> = ({
  open,
  onOk,
  onClose,
  okText,
  loading,
  children,
  title,
  className,
  classNameFooter,
  width = 1500,
  type,
  disableOkButton,
}) => {
  return (
    <Drawer
      className={`customized-drawer-mobile ${className || ''}`}
      onClose={onClose}
      open={open}
      destroyOnClose={true}
      width={width}
      mask={false}
    >
      <div className={`h-full flex flex-col ${type === 'confirm' && 'relative'}`}>
        <div className={`${type === 'confirm' && `w-full justify-center top-[50%] absolute translate-y-[-50%]`}`}>
          {title && (
            <div className="flex w-full justify-center text-[20px] font-medium mb-[30px] mt-[8px]"> {title} </div>
          )}
          {children}
        </div>
        {loading && <LoadingIndicator />}
        <div className={`flex justify-between items-center mt-auto ${classNameFooter}`}>
          <Button
            className="max-h-[61px] mr-[30px]"
            type="submit"
            disabled={loading || disableOkButton}
            key="ok"
            variant="secondary"
            onClick={onOk}
          >
            {okText || 'Confirm'}
          </Button>
          <div className="cursor-pointer mr-[6px]" onClick={onClose}>
            <CloseOutlinedIcon1 width={23} height={22} />
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default CustomizedDrawer;
