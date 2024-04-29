import React, { ButtonHTMLAttributes, FC } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  className?: string;
}

const IconButton: FC<IconButtonProps> = ({ icon, className, ...restProps }) => {
  return (
    <button
      className={`${
        className || ''
      } flex justify-center items-center border border-solid border-black-100 rounded-2xl p-1.5 shadow-none size-12 bg-white`}
      {...restProps}
    >
      {icon}
    </button>
  );
};

export default IconButton;
