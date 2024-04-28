import { ConfigProvider, Menu as MenuLayout, MenuProps as AntdMenuProps } from 'antd';

const Menu: React.FC<AntdMenuProps> = ({ ...restProps }) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedBg: '#fa4a0c',
            itemSelectedColor: '#fff',
            itemBorderRadius: 16,
            itemMarginBlock: 10,
            itemMarginInline: 0,
            itemColor: '#131c16',
            subMenuItemBg: 'transparent',
          },
        },
        token: {
          padding: 26,
          fontSize: 16,
        },
      }}
    >
      <MenuLayout {...restProps} />
    </ConfigProvider>
  );
};

export default Menu;
