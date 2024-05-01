import { ConfigProvider, Segmented } from 'antd';
import { SegmentedValue } from 'antd/es/segmented';
import React, { useState } from 'react';
import './tabs.scss';

interface TabItem {
  label: string;
  component: React.ReactNode;
}

interface Props {
  items: TabItem[];
  className?: string;
  onChange?: (value: SegmentedValue) => void;
}

const Tabs: React.FC<Props> = ({ items, className, onChange }) => {
  const [selectedTab, setSelectedTab] = useState<string | number>(items?.[0].label);

  const handleChange = (value: SegmentedValue) => {
    if (onChange) {
      onChange(value);
    }
    setSelectedTab(value);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          fontSize: 16,
          borderRadius: 16,
        },
        components: {
          Segmented: {
            itemSelectedBg: '#131c16',
            trackPadding: 0,
            itemSelectedColor: 'white',
            trackBg: 'white',
            itemColor: '#131c16',
          },
        },
      }}
    >
      <Segmented
        className={`${className || ''} customized-segmented`}
        options={items.map((item) => item.label)}
        value={selectedTab}
        onChange={handleChange}
        block
      />
      {items.map((item) => {
        if (item.label === selectedTab) {
          return item.component;
        }
        return null;
      })}
    </ConfigProvider>
  );
};

export default Tabs;
