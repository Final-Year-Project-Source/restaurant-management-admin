import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon } from '../Icons';
import './datePicker.scss';

interface DatePickerProps {
  startDate: Date;
  onChange: (date: Date) => void;
  className?: string;
  disabled?: boolean;
}

const DatePickerElement: React.FC<DatePickerProps> = ({ className, startDate, disabled, onChange }) => {
  return (
    <DatePicker
      showIcon
      className={`input-customized ${className || ''}`}
      selected={startDate}
      onChange={onChange}
      minDate={new Date()}
      popperPlacement="bottom-start"
      popperClassName="date-picker-popup"
      showTimeInput
      dateFormat="dd/MM/yyyy HH:mm"
      timeFormat="HH:mm"
      timeInputLabel="Time:"
      toggleCalendarOnIconClick
      icon={
        <div className="!absolute right-0">
          <CalendarIcon />
        </div>
      }
      wrapperClassName="date-picker-wrapper relative !w-[180px]"
      disabled={disabled}
    />
  );
};

export default DatePickerElement;
