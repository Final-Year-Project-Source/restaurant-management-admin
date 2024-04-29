'use client';
import React from 'react';
import type { RadioChangeEvent } from 'antd';
import { Radio } from 'antd';
import CustomRadio from '@/components/radio/Radio';

interface RadioGroupProps {
  groupName: string;
  options?: { label: string }[];
  onChange: (selectedValue: string) => void;
  className?: string;
  value?: string;
  disabled?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ value, groupName, options, className, disabled, onChange }) => {
  const onChangeRadioGroup = (e: RadioChangeEvent) => {
    onChange(e.target.value as string);
  };
  return (
    <div>
      <p className="text-[14px] font-medium mb-[11px] text-black-400">{groupName}</p>
      <Radio.Group onChange={onChangeRadioGroup} value={value} disabled={disabled}>
        <div className={`flex ${className}`}>
          {options?.map((item: { label: string }, index: number) => (
            <div key={index} className="flex items-center text-black-500">
              <CustomRadio value={item.label} />
            </div>
          ))}
        </div>
      </Radio.Group>
    </div>
  );
};

export default RadioGroup;
