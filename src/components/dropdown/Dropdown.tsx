import { Checkbox, CheckboxProps, ConfigProvider, GetProp, Select as SelectElement } from 'antd';
import type { SelectProps } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';
import CustomOption from './CustomOption';
import './dropdown.scss';
import { DownOutlinedIcon } from '../Icons';
import LoadingIndicator from '../loadingIndicator';
import { isEqual } from 'lodash';

interface Props extends SelectProps {
  placeholder?: string;
  onChange?: (value: any) => void;
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
}

type CheckboxValueType = GetProp<typeof Checkbox.Group, 'value'>[number];

const Dropdown: FC<Props> = ({
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
  ...restProps
}) => {
  const [checkedList, setCheckedList] = useState<CheckboxValueType[]>(value || []);
  const allStatuses = options?.flatMap((group: any) => group?.statuses?.map((status: any) => status.value));
  const allCheckedList = Array.isArray(checkedList)
    ? checkedList.flatMap((group: any) => group?.statuses?.map((status: any) => status.value))
    : [];

  // const valuesArray = options.flatMap((option: any) => option.statuses);

  useEffect(() => {
    if (value && !isEqual(value, checkedList)) {
      // Check if value has changed
      setCheckedList(value);
    }
  }, [value, checkedList]); // Include checkedList as a dependency

  const handleOptionChange = (value: any) => {
    if (onChange) {
      onChange(value);
    }
  };

  // const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
  //   setCheckedList(e.target.checked ? options : []);
  //   if (onChange) {
  //     onChange(options);
  //   }
  // };
  const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
    if (e.target.checked) {
      if (multipleGroup) {
        const formattedStatuses = options?.map((group: any) => ({
          id: group.id,
          title: group.title,
          statuses: group.statuses.map((status: any) => status.value),
        }));
        setCheckedList(formattedStatuses);
        if (onChange) {
          onChange(formattedStatuses);
        }
      } else {
        setCheckedList(e.target.checked ? options.map((option: { value: string; label: string }) => option.value) : []);
        if (onChange) {
          onChange(options.map((option: { value: string; label: string }) => option.value));
        }
      }
    } else {
      setCheckedList([]);
      if (onChange) {
        onChange([]);
      }
    }
  };

  const optionsWithEmptyChoice =
    options && Array.isArray(options) ? [{ label: '-', value: '', searchLabel: '-' }, ...options] : [];
  const checkAll = useMemo(() => allStatuses?.length === allCheckedList?.length, [allCheckedList, allStatuses]);

  const getFilterOption = () => {
    if (customFilterOptionsForSearch) {
      return (inputValue: string, option: any) => {
        return option.searchLabel.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
      };
    }
    return (inputValue: string, option: any) => {
      return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
    };
  };

  const filterOption = getFilterOption();
  return (
    <div className="flex flex-col space-y-2 w-full">
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
        {mode === 'tags' ? (
          <SelectElement
            className={`${className || ''} customized-select ${showSearch && ` hidden-selection-item `} small-label`}
            style={{ width: '100%', height: height }}
            {...restProps}
            showSearch={showSearch}
            filterOption={filterOption}
            value={value}
            onChange={onChange}
            options={includeEmptyValue ? optionsWithEmptyChoice : options}
            suffixIcon={<DownOutlinedIcon />}
            dropdownAlign={{ offset: [0, 10] }}
            popupClassName="customized-dropdown tags"
            placeholder={placeholder}
          />
        ) : (
          <SelectElement
            className={`${className || ''} customized-select big-label`}
            {...restProps}
            // maxTagCount="responsive"
            // showSearch
            // allowClear
            // tagRender={tagRender}
            // mode={mode}

            style={{ width: '100%', height: height }}
            placeholder={placeholder}
            onChange={onChange}
            options={options}
            popupClassName="customized-dropdown"
            optionLabelProp="children"
            value={labelItem || value}
            suffixIcon={<DownOutlinedIcon />}
            dropdownStyle={{
              padding: '11px 20px',
            }}
            dropdownAlign={{ offset: [0, 10] }}
            dropdownRender={() => (
              <div>
                {!isLoading ? (
                  <div className="max-h-[450px] overflow-y-auto overflow-x-hidden h-full">
                    {labelAll && (
                      <div className="pt-[5px]">
                        <ConfigProvider
                          theme={{
                            token: {
                              borderRadius: 6,
                              fontSize: fontSizeDropdown,
                              colorText: '#131c16',
                              colorBorder: 'rgba(19, 28, 22, 0.5)',
                            },
                          }}
                        >
                          <Checkbox defaultChecked={true} onChange={onCheckAllChange} checked={checkAll}>
                            {labelAll}
                          </Checkbox>
                        </ConfigProvider>
                        <hr className="customized-divider mt-[11px]" />
                      </div>
                    )}
                    <CustomOption
                      multipleGroup={multipleGroup}
                      values={value}
                      mode={mode}
                      options={options}
                      onValueChange={handleOptionChange}
                      checkAll={checkAll}
                      setCheckedList={setCheckedList}
                      checkedList={checkedList}
                      fontSizeDropdown={fontSizeDropdown}
                      isLoading={isLoading}
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
        )}
      </ConfigProvider>
    </div>
  );
};

export default Dropdown;
