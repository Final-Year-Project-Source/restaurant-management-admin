import { ConfigProvider, Switch as SwitchElement, SwitchProps } from 'antd';
import './switch.scss';

interface Props extends SwitchProps {
  className?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const CustomizedSwitch: React.FC<Props> = ({ className, checked, onChange, ...restProps }) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Switch: {
            trackHeight: 24,
            trackMinWidth: 70,
            handleSize: 18,
          },
        },
        token: {
          fontFamily: 'var(--font-open-sans)',
          fontSize: 11,
        },
      }}
    >
      <SwitchElement
        className={`${className || ''} switch-customized`}
        unCheckedChildren="No"
        checkedChildren="Yes"
        checked={checked}
        onChange={onChange}
        {...restProps}
      />
    </ConfigProvider>
  );
};

export default CustomizedSwitch;
