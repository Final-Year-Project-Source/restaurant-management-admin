'use client';
import { Button as ButtonElement, ButtonProps, ConfigProvider } from 'antd';
import React, { FC } from 'react';
import styles from './styles.module.css';

interface CategoryButtonProps extends ButtonProps {
  className?: string;
  children?: React.ReactNode;
  active?: boolean;
}

const CategoryButton: FC<CategoryButtonProps> = ({ children, className, active, ...restProps }) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            borderRadius: 16,
            fontSize: 16,
            colorPrimaryHover: 'none',
            defaultBorderColor: 'rgba(19, 28, 22, 0.20)',
            defaultGhostBorderColor: 'none',
          },
        },
        token: {
          colorPrimaryActive: 'RGBA(19, 28, 22, 0.2)',
          colorBorder: 'RGBA(19, 28, 22, 0.2)',
        },
      }}
    >
      <ButtonElement
        style={{ fontFamily: 'var(--font-rubik)' }}
        {...restProps}
        className={`${className || ''} ${active ? styles.active : styles.inActive} ${styles.categoryButton}`}
      >
        {children}
      </ButtonElement>
    </ConfigProvider>
  );
};

export default CategoryButton;
