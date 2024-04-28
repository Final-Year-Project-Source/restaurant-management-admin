import React, { FC, ButtonHTMLAttributes } from 'react';
import styles from './styles.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

const Button: FC<ButtonProps> = ({ variant = 'primary', disabled, children, className, ...restProps }) => {
  return (
    <button
      {...restProps}
      className={`${styles[`${variant}Btn`]} ${disabled ? styles.disabledBtn : ''} ${styles.btn} ${
        className || ''
      } flex justify-center items-center whitespace-nowrap w-full rounded-[30px] max-h-[50px] hover:opacity-90`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
