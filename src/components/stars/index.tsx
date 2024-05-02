import React, { useState, useEffect } from 'react';
import '@/components/stars/style.stars.css';
import { Rate } from 'antd';
import { StartIcon, StartIcon2 } from '@/components/Icons';

interface StatsProps {
  onRateChange?: (value: number) => void;
  value?: number;
  disabled?: boolean;
  size?: 'normal' | 'small';
}

const Stars: React.FC<StatsProps> = ({ onRateChange, value: initialValue = 0, disabled, size }) => {
  const [rateValue, setRateValue] = useState<number>(initialValue);

  useEffect(() => {
    setRateValue(initialValue);
  }, [initialValue]);

  const handleRateChange = (value: number) => {
    setRateValue(value);
    if (onRateChange) onRateChange(value);
  };

  return (
    <>
      <Rate
        style={{ fontSize: 25 }}
        character={size === 'small' ? <StartIcon2 /> : <StartIcon />}
        value={rateValue}
        onChange={handleRateChange}
        disabled={disabled}
      />
    </>
  );
};

export default Stars;
