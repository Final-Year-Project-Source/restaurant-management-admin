import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button as ButtonElement, ButtonProps, ConfigProvider } from 'antd';
import { FC } from 'react';
import styles from './styles.module.css';

interface CountButtonProps extends ButtonProps {
  className?: string;
  plus?: boolean;
  variant?: 'primary' | 'secondary';
}

const CountButton: FC<CountButtonProps> = ({ plus = true, variant = 'primary', className, ...restProps }) => {
  const iconColor = variant === 'primary' ? '#131C16' : '#fff';
  const buttonColor = variant === 'primary' ? '#fff' : '#131C16';
  const borderStyle = 'border border-solid border-black-100';
  const iconStyle = { color: iconColor, fontSize: '10px', margin: '0px' };
  const buttonStyle = { backgroundColor: buttonColor };

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimaryHover: 'none',
            defaultBorderColor: 'rgba(19, 28, 22, 0.20)',
            colorBgContainer: 'transparent',
          },
        },
        token: {
          colorPrimaryActive: 'RGBA(19, 28, 22, 0.2)',
          colorBorder: 'RGBA(19, 28, 22, 0.2)',
          borderRadius: 4,
        },
      }}
    >
      <ButtonElement
        {...restProps}
        className={`${className || ''} ${borderStyle} ${styles.countBtn} `}
        icon={plus ? <PlusOutlined style={iconStyle} /> : <MinusOutlined style={iconStyle} />}
        size="small"
        style={buttonStyle}
      />
    </ConfigProvider>
  );
};

export default CountButton;
