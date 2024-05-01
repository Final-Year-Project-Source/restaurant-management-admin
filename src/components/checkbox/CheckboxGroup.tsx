'use client';
import React from 'react';
import CustomCheckbox from '@/components/checkbox/Checkbox';
import { Checkbox } from 'antd';
import '@/components/checkbox/style.checkbox.css';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import { open_sans } from '@/utils/fontUtils';
import { getDiscountedPrice } from '@/utils/commonUtils';
interface CheckboxOption {
  icon?: string;
  label: string;
  price?: string;
}

interface CheckboxGroupProps {
  discount?: any;
  groupName: string;
  options: CheckboxOption[];
  onChange: (selectedValues: CheckboxValueType[], groupName: string) => void;
  defaultValue?: CheckboxValueType[];
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ discount, groupName, options, onChange, defaultValue }) => {
  const onChangeCheckbox = (checkedValues: CheckboxValueType[]) => {
    onChange(checkedValues, groupName);
  };
  return (
    <div>
      <p className="text-[14px] font-medium mb-[11px] text-black-400">{groupName}</p>
      <Checkbox.Group defaultValue={defaultValue} className="flex flex-col w-full" onChange={onChangeCheckbox}>
        <div className="flex flex-col space-y-[10px]">
          {options?.map((item: CheckboxOption, index: number) => (
            <div key={index} className="flex justify-between items-center text-black-500 w-full">
              <CustomCheckbox value={item.label} icon={item?.icon?.toLowerCase()} price={item.price} />
              {item.price && (
                <label className={`text-[14px] ${open_sans.className}`} htmlFor={`${groupName}-${index}`}>
                  {`+ `}
                  {discount?.type === 'FIXED_PERCENT' && <span className="line-through"> {item.price}</span>}
                  {` ${getDiscountedPrice(+item.price, discount)}`}
                </label>
              )}
            </div>
          ))}
        </div>
      </Checkbox.Group>
    </div>
  );
};

export default CheckboxGroup;
