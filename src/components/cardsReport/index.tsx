import { Rate } from 'antd';
import { isNumber } from 'lodash';
import React, { useState } from 'react';
// import './cardsReport.scss';

interface SalesItem {
  label: any;
  value: string | number;
}

interface CardProps {
  data: any;
  handleChange?: (label: string) => void;
  className?: string;
  isFeedback?: boolean;
  isStar?: boolean;
}

const CardsReport: React.FC<CardProps> = ({ data, handleChange, className, isFeedback = false, isStar = false }) => {
  const [activeIndex, setActiveIndex] = useState<string | null>(data?.[0]?.options?.[0].label);

  const handleChangeValue = (label: string) => {
    setActiveIndex(label === activeIndex ? null : label);
    handleChange && handleChange(label);
  };

  return (
    <div className={``}>
      {data?.map((group: any, index: number) => (
        <div key={index}>
          {group?.title && <div className="font-bold text-[17px] my-3">{group?.title}</div>}
          <div className={`${className || ''} snap-x flex m-[-10px] w-full`}>
            {group.options.map((item: SalesItem, idx: number) => (
              <button
                type="button"
                key={idx}
                className={`hover:min-[768px]:opacity-50 snap-start shrink-0 flex flex-col m-[10px] min-w-[154px] w-[14%] h-[75px] border-[0.5px] border-black-500 ${
                  isFeedback ? 'px-3 py-[10px]' : 'px-[30px] py-[18px]'
                } rounded-2xl justify-center items-center ${
                  activeIndex === item.label ? 'bg-black-500 text-white pointer-events-none' : 'bg-white text-black-500'
                }`}
                onClick={() => handleChangeValue(item.label)}
              >
                {isNumber(item.label) ? (
                  <Rate className="rate-customized" disabled value={Number(item.label)} />
                ) : (
                  <label className={`${isFeedback ? 'text-[13px]' : 'text-[11px]'} font-open-sans text-wrap`}>
                    {item.label}
                  </label>
                )}
                <span className={isFeedback ? 'text-[13px]' : 'text-[16px]'}>
                  {isFeedback ? `(${item.value})` : item.value}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardsReport;
