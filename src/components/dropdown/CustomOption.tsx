import { Checkbox, ConfigProvider, Radio, RadioChangeEvent } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import React, { FC, useEffect, useState } from 'react';
import LoadingIndicator from '../LoadingIndicator';
import './dropdown.scss';

interface CustomOptionProps {
  options: any[];
  onValueChange: (value: string | string[]) => void;
  mode?: 'tags' | 'multiple';
  values?: any;
  multipleGroup?: boolean;
  checkAll?: boolean;
  setCheckedList?: any;
  checkedList?: any;
  fontSizeDropdown?: number;
  isLoading?: boolean;
}

const CustomOption: FC<CustomOptionProps> = ({
  setCheckedList,
  checkedList,
  options,
  onValueChange,
  mode,
  values,
  multipleGroup,
  checkAll = true,
  fontSizeDropdown,
  isLoading,
}) => {
  const [valueRadio, setValueRadio] = useState<string>(values || '');

  const handleChangeCheckbox = (list: CheckboxValueType[]) => {
    setCheckedList(list);
    onValueChange(list.map((item) => item.toString()));
  };

  const handleChangeRadio = (e: RadioChangeEvent) => {
    const { value } = e.target;
    setValueRadio(value);
    onValueChange(value);
  };

  const handleChangeCheckboxGroup = (list: CheckboxValueType[], index: number) => {
    setCheckedList((prevState: any) => {
      const newLists = [...prevState];
      newLists[index] = { statuses: [...list] };
      onValueChange(newLists);

      return newLists;
    });
  };

  return (
    <div className="customized-option text-sm flex flex-col space-y-[17px] mt-[6px]">
      {mode ? (
        <ConfigProvider
          theme={{
            token: {
              borderRadius: 6,
              fontSize: fontSizeDropdown,
              colorText: '#131c16',
              colorBgContainerDisabled: 'rgba(19, 28, 22, 0.5)',
              colorTextDisabled: 'rgba(19, 28, 22, 0.5)',
              colorBorder: 'rgba(19, 28, 22, 0.5)',
              // fontFamily: 'var(--font-open-sans)',
            },
          }}
        >
          {multipleGroup ? (
            options?.map((option: any, index: number) => (
              <div className="flex flex-col space-y-[17px]" key={index}>
                {option.title && <label className="pl-5 font-medium text-[14px] leading-[26px]">{option.title}</label>}
                <div className="flex flex-col space-y-[20px]">
                  <Checkbox.Group
                    options={option?.statuses}
                    value={checkedList?.[index]?.statuses?.map((status: any) => status.value || status)}
                    onChange={(list) => handleChangeCheckboxGroup(list, index)}
                    // disabled={checkAll}
                  />
                </div>
              </div>
            ))
          ) : (
            <Checkbox.Group
              // disabled={checkAll}
              className="mt-[4px]"
              value={checkedList}
              onChange={handleChangeCheckbox}
            >
              {options?.map((option: any, index: number) => (
                <div className="flex flex-col w-full" key={index}>
                  <Checkbox value={option.value}>{option.label}</Checkbox>
                  {option.subTitle && (
                    <div className="sub-title pl-[21px] text-[11px] opacity-50  text-ellipses">{option.subTitle}</div>
                  )}
                </div>
              ))}
            </Checkbox.Group>
          )}
        </ConfigProvider>
      ) : (
        <ConfigProvider
          theme={{
            token: {
              fontSize: fontSizeDropdown,
              colorText: '#131c16',
              fontFamily: 'var(--font-open-sans)',
            },
            components: {
              Radio: {
                radioSize: 20,
                dotSize: 8,
              },
            },
          }}
        >
          {isLoading ? (
            <div className="min-h-[124px]">
              <LoadingIndicator />
            </div>
          ) : (
            <Radio.Group className="flex flex-col" value={valueRadio} onChange={handleChangeRadio}>
              {options?.map((option: any, index: number) => (
                <Radio value={option.value} key={index}>
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>
          )}
        </ConfigProvider>
      )}
    </div>
  );
};

export default CustomOption;
