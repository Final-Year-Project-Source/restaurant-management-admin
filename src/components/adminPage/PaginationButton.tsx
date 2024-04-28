import React, { FC, ButtonHTMLAttributes } from 'react';
import styles from './styles.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
  variant?: 'navigation' | 'inactive' | 'active' | 'space';
  disabled?: boolean;
  icon?: React.ReactNode;
}

const PaginationButton: FC<ButtonProps> = ({
  icon,
  variant = 'primary',
  disabled,
  children,
  className,
  ...restProps
}) => {
  return (
    <button
      {...restProps}
      className={`${styles[`${variant}SmallBtn`]} ${disabled ? styles.disabledSmallBtn : ''} ${styles.smallBtn} ${
        className || ''
      } flex justify-center items-center text-center whitespace-nowrap rounded-[16px] ${
        disabled ? '' : 'hover:opacity-50'
      } max-h-[38px]`}
      disabled={disabled}
    >
      <div className="flex items-center justify-center">
        {icon && <div className="px-[5px]">{icon}</div>}
        <div>{children}</div>
      </div>
    </button>
  );
};

export default PaginationButton;
