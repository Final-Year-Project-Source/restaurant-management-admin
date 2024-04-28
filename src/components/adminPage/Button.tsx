import React, { FC, ButtonHTMLAttributes } from 'react';
import styles from './styles.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  icon?: React.ReactNode;
}

const Button: FC<ButtonProps> = ({ icon, variant = 'primary', disabled, children, className, ...restProps }) => {
  return (
    <button
      {...restProps}
      className={`${styles[`${variant}Btn`]} ${disabled ? styles.disabledBtn : ''} ${styles.btn} ${
        className || ''
      } flex justify-center items-center text-center whitespace-nowrap rounded-[30px] hover:opacity-50 max-h-[50px]`}
      disabled={disabled}
    >
      <div className="flex items-center justify-center space-x-[10px]">
        {icon && <div>{icon}</div>}

        <div>{children}</div>
      </div>
    </button>
  );
};

export default Button;
