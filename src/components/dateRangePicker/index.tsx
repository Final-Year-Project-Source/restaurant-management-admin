'use client';
import React, { useEffect, useState } from 'react';
import DatePicker, { CalendarContainer } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, ConfigProvider } from 'antd';
import { ArrowLeftIcon1, ArrowRightIcon } from '../Icons';
import './dateRangePicker.scss';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import moment from 'moment';
import { formatEndDate, formatStartDate } from '@/utils/commonUtils';

interface DateRangePickerProps {
  dateRange: [Date | null, Date | null];
  onChange: (startDate: Date | null, endDate: Date | null) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateRange, onChange }) => {
  const [activeIndex, setActiveIndex] = useState<string | null>('This week');
  const [startDate, endDate] = dateRange;
  const [isOpen, setIsOpen] = useState(true);
  const { isMobile, width } = useWindowDimensions();
  const [isOnClick, setIsOnClick] = useState(false);

  useEffect(() => {
    if (isOnClick) {
      return;
    }

    const index = rangePresets.findIndex(
      (preset) =>
        moment(preset.value['startDate']).isSame(moment(startDate), 'day') &&
        moment(preset.value['endDate']).isSame(moment(endDate), 'day'),
    );
    if (index !== -1) {
      setActiveIndex(rangePresets[index].label);
    } else {
      setActiveIndex(null);
    }
  }, [dateRange, isOnClick]);

  const handleRangeDateChange = (sDate: any, eDate: any) => {
    onChange(formatStartDate(sDate), formatEndDate(eDate));
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setIsOnClick(false);
    handleRangeDateChange(formatStartDate(dates[0]), formatEndDate(dates[1]));
  };

  const handleDecreaseDate = () => {
    const newStartDate = new Date(startDate ?? new Date());

    newStartDate.setDate(newStartDate.getDate() - 1);
    handleRangeDateChange(newStartDate, endDate);
  };

  const handleIncreaseDate = () => {
    const newEndDate = new Date(endDate ?? new Date());
    newEndDate.setDate(newEndDate.getDate() + 1);
    handleRangeDateChange(startDate, newEndDate);
  };

  const handlePresetClick = (index: string, presetValue: { startDate: Date; endDate: Date }) => {
    const { startDate, endDate } = presetValue;
    handleRangeDateChange(startDate, endDate);

    setActiveIndex(index);
    setIsOnClick(true);
  };

  const renderDayContents = (dayOfMonths: number, date: Date) => {
    return <div className="relative z-[1]">{(date.getDate() < 10 ? '0' : '') + date.getDate()}</div>;
  };

  const CustomInput = React.forwardRef((props: React.HTMLProps<HTMLInputElement>, ref: React.Ref<HTMLInputElement>) => (
    <ConfigProvider
      theme={{
        token: {
          colorPrimaryHover: 'rgba(19, 28, 22)',
          colorPrimaryBorder: 'rgba(19, 28, 22. 0.2)',
        },
      }}
    >
      <div className="flex flex-row h-full">
        <Button
          disabled={!startDate}
          size="large"
          className="arrow-left bg-white !w-[38px]"
          icon={<ArrowLeftIcon1 />}
          onClick={handleDecreaseDate}
        />
        <input {...props} className="input-range-date" />
        <Button
          disabled={!endDate || moment(endDate).isSame(moment(), 'day')}
          size="large"
          className="arrow-right bg-white !w-[38px]"
          icon={<ArrowRightIcon />}
          onClick={handleIncreaseDate}
        />
      </div>
    </ConfigProvider>
  ));

  CustomInput.displayName = 'CustomInput';

  const CustomCalendar = ({ className, children }: { className?: string; children: React.ReactNode }) => {
    return (
      <div className={`flex ${isOpen ? 'block' : 'hidden'}`}>
        <CalendarContainer className={className}>{children}</CalendarContainer>
        {!isMobile && (
          <div className="pt-[16px] pl-[10px] pr-[25px] range-presets flex flex-col items-start justify-start space-y-[10px]">
            {rangePresets &&
              Array.isArray(rangePresets) &&
              rangePresets.map((item: any, index: number) => (
                <button
                  key={index}
                  type="button"
                  className={`btn-customized text-sm text-start hover:bg-black-100 py-[5px] px-[10px] rounded-2xl w-[94px] 
                  ${activeIndex == item.label ? 'bg-black-500 text-white hover:text-black hover:bg-black-500' : ''}`}
                  onClick={() => {
                    handlePresetClick(item.label, item.value);
                  }}
                >
                  {item.label}
                </button>
              ))}
          </div>
        )}
      </div>
    );
  };

  CustomCalendar.displayName = 'CustomCalendar';

  return (
    <DatePicker
      onInputClick={() => setIsOpen(true)}
      className={`range-input-customized ${isMobile ? `!w-[${width - 40}px]` : ''}`}
      dateFormat="dd MMM yyyy"
      selectsRange
      startDate={startDate}
      endDate={endDate}
      onChange={handleDateChange}
      calendarClassName="calendar-customized"
      popperClassName="popup"
      wrapperClassName="date-range-picker"
      customInput={<CustomInput />}
      calendarContainer={({ children, className }) => <CustomCalendar className={className}>{children}</CustomCalendar>}
      shouldCloseOnSelect={false}
      maxDate={new Date()}
      openToDate={endDate || undefined}
      renderDayContents={renderDayContents}
      popperPlacement="bottom-start"
    />
  );
};

export default DateRangePicker;

// const getStartOfWeek = (date: Date) => {
//   const day = date.getDay();
//   const diff = day === 0 ? -6 : 1 - day; // Adjust for Sunday (0) being the start of the week
//   const startOfWeek = new Date(date);
//   startOfWeek.setDate(date.getDate() + diff);
//   startOfWeek.setHours(0, 0, 0, 0);
//   return startOfWeek;
// };

// const getEndOfWeek = (date: Date) => {
//   const day = date.getDay();
//   const diff = day === 0 ? 0 : 7 - day; // Adjust for Sunday (0) being the start of the week
//   const endOfWeek = new Date(date);
//   endOfWeek.setDate(date.getDate() + diff);
//   endOfWeek.setHours(23, 59, 59, 999);
//   return endOfWeek;
// };

// const rangePresets = [
//   {
//     label: 'Today',
//     value: {
//       startDate: new Date(new Date().setHours(0, 0, 0, 0)),
//       endDate: new Date(),
//     },
//   },
//   {
//     label: 'Yesterday',
//     value: {
//       startDate: (() => {
//         const yesterday = new Date();
//         yesterday.setDate(yesterday.getDate() - 1);
//         yesterday.setHours(0, 0, 0, 0);
//         return yesterday;
//       })(),
//       endDate: (() => {
//         const yesterday = new Date();
//         yesterday.setDate(yesterday.getDate() - 1);
//         yesterday.setHours(23, 59, 59, 999);
//         return yesterday;
//       })(),
//     },
//   },
//   {
//     label: 'This week',
//     value: {
//       startDate: getStartOfWeek(new Date()),
//       endDate: getEndOfWeek(new Date()),
//     },
//   },
//   {
//     label: 'Last week',
//     value: {
//       startDate: (() => {
//         const lastWeek = new Date();
//         lastWeek.setDate(lastWeek.getDate() - 7);
//         return getStartOfWeek(lastWeek);
//       })(),
//       endDate: (() => {
//         const lastWeek = new Date();
//         lastWeek.setDate(lastWeek.getDate() - 7);
//         return getEndOfWeek(lastWeek);
//       })(),
//     },
//   },
//   {
//     label: 'This month',
//     value: {
//       startDate: (() => {
//         const thisMonth = new Date();
//         thisMonth.setDate(1);
//         thisMonth.setHours(0, 0, 0, 0);
//         return thisMonth;
//       })(),
//       endDate: new Date(),
//     },
//   },
//   {
//     label: 'Last month',
//     value: {
//       startDate: (() => {
//         const lastMonth = new Date();
//         lastMonth.setMonth(lastMonth.getMonth() - 1);
//         lastMonth.setDate(1);
//         lastMonth.setHours(0, 0, 0, 0);
//         return lastMonth;
//       })(),
//       endDate: (() => {
//         const lastMonthEnd = new Date();
//         lastMonthEnd.setDate(0);
//         lastMonthEnd.setHours(23, 59, 59, 999);
//         return lastMonthEnd;
//       })(),
//     },
//   },
// ];

const rangePresets = [
  {
    label: 'Today',
    value: {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)),
      endDate: new Date(),
    },
  },
  {
    label: 'Yesterday',
    value: {
      startDate: (() => {
        const yesterdayStartDate = new Date();
        yesterdayStartDate.setDate(yesterdayStartDate.getDate() - 1);
        yesterdayStartDate.setHours(0, 0, 0, 0);
        return yesterdayStartDate;
      })(),
      endDate: (() => {
        const yesterdayEndDate = new Date();
        yesterdayEndDate.setDate(yesterdayEndDate.getDate() - 1);
        yesterdayEndDate.setHours(23, 59, 59, 999);
        return yesterdayEndDate;
      })(),
    },
  },
  {
    label: 'This week',
    value: {
      startDate: (() => {
        const thisWeekStartDate = new Date();
        thisWeekStartDate.setDate(thisWeekStartDate.getDate() - thisWeekStartDate.getDay() + 1);
        thisWeekStartDate.setHours(0, 0, 0, 0);
        return thisWeekStartDate;
      })(),
      endDate: new Date(),
    },
  },
  {
    label: 'Last week',
    value: {
      startDate: (() => {
        const lastWeekStartDate = new Date();
        lastWeekStartDate.setDate(lastWeekStartDate.getDate() - lastWeekStartDate.getDay() - 6);
        lastWeekStartDate.setHours(0, 0, 0, 0);
        return lastWeekStartDate;
      })(),
      endDate: (() => {
        const lastWeekEndDate = new Date();
        lastWeekEndDate.setDate(lastWeekEndDate.getDate() - lastWeekEndDate.getDay());
        lastWeekEndDate.setHours(23, 59, 59, 999);
        return lastWeekEndDate;
      })(),
    },
  },
  {
    label: 'This month',
    value: {
      startDate: (() => {
        const thisMonthStartDate = new Date();
        thisMonthStartDate.setDate(1);
        thisMonthStartDate.setHours(0, 0, 0, 0);
        return thisMonthStartDate;
      })(),
      endDate: new Date(),
    },
  },
  {
    label: 'Last month',
    value: {
      startDate: (() => {
        const lastMonthStartDate = new Date();
        lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1);
        lastMonthStartDate.setDate(1);
        lastMonthStartDate.setHours(0, 0, 0, 0);
        return lastMonthStartDate;
      })(),
      endDate: (() => {
        const lastMonthEndDate = new Date();
        lastMonthEndDate.setDate(0);
        lastMonthEndDate.setHours(23, 59, 59, 999);
        return lastMonthEndDate;
      })(),
    },
  },
];
