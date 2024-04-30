import React, { useState } from 'react';

interface SalesItem {
  label: string;
  value: string;
}

interface CardProps {
  data: SalesItem[];
  handleChange?: (label: string) => void;
  className?: string;
}

const CardsReport: React.FC<CardProps> = ({ data, handleChange, className }) => {
  const [activeIndex, setActiveIndex] = useState<string | null>(data?.[0]?.label);

  const handleChangeValue = (label: string) => {
    setActiveIndex(label === activeIndex ? null : label);
    handleChange && handleChange(label);
  };

  return (
    <div className={`${className || ''} snap-x flex sales-summary-buttons m-[-10px] w-full`}>
      {data?.map((item: SalesItem) => (
        <button
          type="button"
          key={item?.label}
          className={`hover:min-[768px]:opacity-50 snap-start shrink-0 flex flex-col m-[10px] min-w-[154px] w-[14%] h-[75px] border-[0.5px] border-black-500 px-[30px] py-[18px] rounded-2xl justify-center items-center ${
            activeIndex === item?.label ? 'bg-black-500 text-white pointer-events-none' : 'bg-white text-black-500'
          }`}
          onClick={() => handleChangeValue(item?.label)}
        >
          <label className="text-[11px] font-open-sans">{item?.label}</label>
          <span className="text-[16px]">{item?.value}</span>
        </button>
      ))}
    </div>
  );
};

export default CardsReport;
