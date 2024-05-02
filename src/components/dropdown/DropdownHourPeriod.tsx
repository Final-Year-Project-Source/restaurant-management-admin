import { Checkbox, ConfigProvider, GetProp, Select as SelectElement } from 'antd';
import type { SelectProps } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';
import CustomOption from './CustomOption';
import './dropdown.scss';
import { DownOutlinedIcon } from '../Icons';
import LoadingIndicator from '../LoadingIndicator';
import { isEqual } from 'lodash';
import { TimePicker } from 'antd';
import dayjs from 'dayjs';
interface Props extends SelectProps {
  placeholder?: string;
  onChange?: (value: any) => void;
  handleChangeCustomTime?: (value: any) => void;
  label?: string;
  className?: string;
  mode?: 'tags' | 'multiple';
  options?: any;
  customFilterOptionsForSearch?: any;
  labelAll?: string;
  value?: any;
  labelItem?: string | string[];
  height?: number;
  multipleGroup?: boolean;
  fontSize?: number;
  fontSizeDropdown?: number;
  includeEmptyValue?: boolean;
  showSearch?: boolean;
  isLoading?: boolean;
  startHour?: string;
  endHour?: string;
}

type CheckboxValueType = GetProp<typeof Checkbox.Group, 'value'>[number];
const format = 'HH';
const DropdownHourPeriod: FC<Props> = ({
  className,
  label,
  onChange,
  placeholder,
  includeEmptyValue = true,
  mode,
  options,
  customFilterOptionsForSearch,
  labelAll,
  value,
  labelItem,
  height = 38,
  fontSize = 13,
  fontSizeDropdown = 13,
  multipleGroup = false,
  showSearch = false,
  isLoading,
  handleChangeCustomTime,
  endHour = '23',
  startHour = '0',
  ...restProps
}) => {
  const [checkedList, setCheckedList] = useState<CheckboxValueType[]>(value || []);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (value && !isEqual(value, checkedList)) {
      setCheckedList(value);
    }
  }, [value, checkedList]);

  const handleOptionChange = (value: any) => {
    if (onChange) {
      onChange(value);
    }
  };
  const OptionHourPeriod = [
    { label: 'Cả ngày', value: 'Cả ngày' },
    {
      label: (
        <div className="flex flex-col w-full">
          <div className="mb-1">Tuỳ chỉnh</div>
          <div className="flex text-[12px] ml-[10px] flex-row space-x-[52px]">
            <p>Bắt đầu</p> <p>Kết thúc</p>
          </div>
          <div className="w-full hour-picker">
            <TimePicker.RangePicker
              allowClear={false}
              allowEmpty={[false, true]}
              placeholder={['', '']}
              value={[dayjs(`${startHour}:00`, format), dayjs(`${endHour}`, format)]}
              defaultValue={[dayjs(`${startHour}:00`, format), dayjs(`${endHour}`, format)]}
              onChange={handleChangeCustomTime}
              suffixIcon={null}
              format={format}
              needConfirm={true}
              order={true}
            />
          </div>
        </div>
      ),
      value: 'Custom period',
    },
  ];

  useEffect(() => {
    function handleClick(event: any) {
      const isCustomSelectClicked = event.target.closest('.customized-select');

      if (isCustomSelectClicked) {
        setIsOpen(!isOpen);
      } else if (
        !event.target.closest('.customized-dropdown') &&
        !event.target.closest('.ant-picker-panel-container')
      ) {
        setIsOpen(false);
      }
    }

    function handleScroll() {
      setIsOpen(false);
    }

    const appBodyElement = document.querySelector('.app-body');
    if (appBodyElement) {
      appBodyElement.addEventListener('scroll', handleScroll);
    }

    window.addEventListener('click', handleClick);

    return () => {
      if (appBodyElement) {
        appBodyElement.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('click', handleClick);
    };
  }, [isOpen]);

  const dropdown = useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-col space-y-2 w-full" ref={dropdown}>
      {label && <label className="text-md font-medium text-black-500">{label}</label>}
      <ConfigProvider
        theme={{
          token: {
            colorText: '#131C16',
            fontSize: fontSize,
            colorBgContainer: 'transparent',
            colorBorder: 'rgba(19, 28, 22, 0.2)',
            colorPrimary: 'rgba(19, 28, 22, 0.2)',
            colorTextPlaceholder: 'rgba(0, 0, 0, 0.50)',
            borderRadius: 16,
          },
          components: {
            Select: {
              optionSelectedBg: 'rgba(19, 28, 22, 0.2)',
              multipleItemBorderColor: '1px solid rgba(19, 28, 22, 0.20)',
              fontWeightStrong: 400,
            },
          },
        }}
      >
        <SelectElement
          className={`${className || ''} customized-select big-label`}
          {...restProps}
          style={{ width: '100%', height: height }}
          placeholder={placeholder}
          onChange={onChange}
          open={isOpen}
          options={OptionHourPeriod}
          popupClassName="customized-dropdown"
          optionLabelProp="children"
          value={labelItem || value}
          suffixIcon={<DownOutlinedIcon />}
          dropdownStyle={{
            padding: '11px 20px',
          }}
          dropdownAlign={{ offset: [0, 10] }}
          dropdownRender={(e) => (
            <div
              onMouseDown={(e) => {
                // e.preventDefault();
                // e.stopPropagation();
              }}
            >
              {!isLoading ? (
                <div className="max-h-[450px] overflow-y-auto overflow-x-hidden h-full">
                  <CustomOption
                    multipleGroup={multipleGroup}
                    values={value}
                    mode={mode}
                    options={OptionHourPeriod}
                    onValueChange={handleOptionChange}
                    setCheckedList={setCheckedList}
                    checkedList={checkedList}
                    fontSizeDropdown={fontSizeDropdown}
                  />
                </div>
              ) : (
                <div className="min-h-[124px]">
                  <LoadingIndicator />
                </div>
              )}
            </div>
          )}
        />
      </ConfigProvider>
    </div>
  );
};

export default DropdownHourPeriod;
