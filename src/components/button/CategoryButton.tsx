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
            borderRadius: 0,
            fontSize: 16,
            colorPrimaryHover: 'transparent',
            defaultBorderColor: 'transparent',
            defaultGhostBorderColor: 'transparent',
            colorPrimaryActive: 'transparent',
          },
        },
        token: {
          colorPrimaryActive: 'transparent',
          colorBorder: 'transparent',
          colorBgTextActive: 'transparent',
        },
      }}
    >
      <ButtonElement
        type="text"
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
