'use client';
import React from 'react';
import '@/components/checkbox/style.checkbox.css';
import { Checkbox, ConfigProvider } from 'antd';
import Icon from '@/components/DietaryIcons';
import { open_sans } from '@/utils/fontUtils';
interface CustomRadioProps {
  value: string;
  icon?: string;
  price?: string;
}

const CustomRadio: React.FC<CustomRadioProps> = ({ value, icon, price }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimaryActive: '#131C16',
          colorPrimary: '#131C16',
          colorPrimaryHover: '#131C16',
          colorBorder: 'RGBA(19, 28, 22, 0.2)',
          controlInteractiveSize: 20,
          colorBgContainer: 'transparent',
        },
      }}
    >
      <div className="flex items-center">
        <Checkbox value={value}>
          <div className="flex justify-between text-black-500 ml-[3px]">
            <div className="flex items-center">
              {icon && (
                <div className="mr-[8px]">
                  <Icon iconName={icon} />
                </div>
              )}
              <div className={`text-[14px] ${open_sans.className}`}>{`${value}`}</div>
            </div>
          </div>
        </Checkbox>
      </div>
    </ConfigProvider>
  );
};

export default CustomRadio;
