'use client';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { useVerifyRefreshTokenMutation } from '@/redux/services/employeeApi';
import { RootState } from '@/redux/store';
import { ITEMS, MENU_ITEMS } from '@/utils/constants';
import { Avatar, Breadcrumb, Button, ConfigProvider, Drawer, Layout as CustomLayout, MenuProps } from 'antd';
import { capitalize } from 'lodash';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Menu from '../adminPage/Menu';
import {
  CloseOutlinedIcon,
  DownOutlinedIcon,
  ItemsIcon,
  MenuOutlinedIcon,
  OrdersIcon,
  ReportsIcon,
  SettingIcon,
} from '../Icons';
import LoadingIndicator from '../LoadingIndicator';
import './layout.scss';

const { Header, Sider } = CustomLayout;

interface Props {
  children?: React.ReactNode;
}

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

function getDivider(key: React.Key): MenuItem {
  return {
    key,
    type: 'divider',
  } as MenuItem;
}

const MenuSingle = ({ currentPath, onClick, items }: { currentPath: string; onClick: any; items: any }) => (
  <Menu
    className="customized-menu font-medium"
    mode="inline"
    selectedKeys={[currentPath]}
    // defaultOpenKeys={MENU_ITEMS?.filter((item) => item.subs.includes(currentPath)).map((item) => item.parent)}
    defaultOpenKeys={MENU_ITEMS.map((item) => item.parent)}
    onClick={onClick}
    items={items}
    expandIcon={
      <div className="expand-icon">
        <DownOutlinedIcon />
      </div>
    }
  />
);

const Layout: FC<Props> = ({ children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [managementName, setManagementName] = useState('');
  const [currentPath, setCurrentPath] = useState('employees');
  const { isMobile } = useWindowDimensions();

  const pathname = usePathname();
  const firstPath = pathname.split('/')[1];
  // const [verifyRefreshToken] = useVerifyRefreshTokenMutation();
  const urlPage = useSelector((state: RootState) => state.URLPages);

  useEffect(() => {
    setCurrentPath(firstPath);
    setManagementName(`${capitalize(firstPath?.split('-')?.join(' '))}`);
  }, [pathname, firstPath]);

  const authenticatedRoutes = ['/login', '/force-change-default-password', '/2fa', '/register'];

  // const firstLetter = session?.user.name?.charAt(0).toUpperCase();
  // const itemsAvatar: MenuProps['items'] = [
  //   {
  //     key: '1',
  //     label: (
  //       <div
  //         className="flex items-center w-full text-[14px] space-x-4"
  //         onClick={() => {
  //           router.push('/change-password');
  //         }}
  //       >
  //         <ReloadOutlined />
  //         <span>Change Password</span>
  //       </div>
  //     ),
  //   },
  //   {
  //     key: '2',
  //     label: (
  //       <div
  //         className="flex items-center w-full text-[14px] space-x-4"
  //         onClick={async () => {
  //           await signOut();
  //           router.push('/login');
  //         }}
  //       >
  //         <LogoutOutlined />
  //         <span>Sign out</span>
  //       </div>
  //     ),
  //   },
  // ];
  const refresh_token = session?.user?.refresh_token || '';

  // useEffect(() => {
  //   const handleOnline = () => {
  //     if (session) {
  //       const interval = setInterval(() => {
  //         if (navigator.onLine) {
  //           verifyRefreshToken()
  //             .unwrap()
  //             .then()
  //             .catch((error) => {
  //               toast.error(error?.data?.message);
  //               signOut();
  //             });
  //         }
  //       }, 15000);
  //     }
  //   };
  //   const handleOffline = () => {
  //     toast.error('No internet connection');
  //   };
  //   handleOnline();
  //   window.addEventListener('offline', handleOffline);
  //   window.addEventListener('online', handleOnline);

  //   return () => {
  //     window.removeEventListener('online', handleOnline);
  //     window.removeEventListener('offline', handleOffline);
  //   };
  // }, [session]);

  //handle MenuItems match with role
  const items: MenuItem[] = [];

  // if (session && session.user && session.user.role) { //fixed
  // if (session.user.role === 'Administrator') {
  items.push(
    getItem(
      'Đơn hàng',
      'orders',
      <div className="min-w-[15px]">
        <OrdersIcon />
      </div>,
      [getItem('Hoá đơn', 'bills'), getItem('Nhà bếp', 'kitchen-display'), getDivider('divider1')],
    ),
    getItem(
      'Thống kê',
      'reports',
      <div className="min-w-[17px]">
        <ReportsIcon />
      </div>,
      [getItem('Doanh thu', 'sales-summary'), getItem('Món ăn', 'sales-by-item'), getDivider('divider2')],
    ),
    getItem(
      'Mặt hàng',
      'items',
      <div className="min-w-[19px]">
        <ItemsIcon />
      </div>,
      [
        getItem('Sản phẩm', 'products'),
        getItem('Lựa chọn', 'modifiers'),
        getItem('Danh mục', 'menu-categories'),
        getItem('Nhóm', 'groups'),
        getItem('Giảm giá', 'discounts'),
        getDivider('divider3'),
      ],
    ),
    getItem(
      'Cài đặt',
      'settings',
      <div className="min-w-[19px]">
        <SettingIcon />
      </div>,
      [getItem('Bàn ăn', 'tables'), getItem('Nhân viên', 'employees')],
    ),
  );
  // } else if (session.user.role === 'Manager') {
  //   items.push(
  //     getItem(
  //       'Orders',
  //       'orders',
  //       <div className="min-w-[15px]">
  //         <OrdersIcon />
  //       </div>,
  //       [getItem('Bills', 'bills'), getItem('Kitchen display', 'kitchen-display'), getDivider('divider1')],
  //     ),
  //     getItem(
  //       'Reports',
  //       'reports',
  //       <div className="min-w-[17px]">
  //         <ReportsIcon />
  //       </div>,
  //       [
  //         getItem('Sales summary', 'sales-summary'),
  //         getItem('Sales by item', 'sales-by-item'),
  //         getDivider('divider2'),
  //       ],
  //     ),
  //     getItem(
  //       'Items',
  //       'items',
  //       <div className="min-w-[19px]">
  //         <ItemsIcon />
  //       </div>,
  //       [
  //         getItem('Products', 'products'),
  //         getItem('Modifiers', 'modifiers'),
  //         getItem('Menu categories', 'menu-categories'),
  //         getItem('Groups', 'groups'),
  //         getItem('Discounts', 'discounts'),
  //         getDivider('divider3'),
  //       ],
  //     ),
  //     getItem(
  //       'Settings',
  //       'settings',
  //       <div className="min-w-[19px]">
  //         <SettingIcon />
  //       </div>,
  //       [getItem('Tables', 'tables'), getItem('Account', 'account')],
  //     ),
  //   );
  // } else if (session.user.role === 'Standard') {
  //   items.push(
  //     getItem(
  //       'Orders',
  //       'orders',
  //       <div className="min-w-[15px]">
  //         <OrdersIcon />
  //       </div>,
  //       [getItem('Bills', 'bills'), getItem('Kitchen display', 'kitchen-display'), getDivider('divider1')],
  //     ),
  //     getItem(
  //       'Items',
  //       'items',
  //       <div className="min-w-[19px]">
  //         <ItemsIcon />
  //       </div>,
  //       [getItem('Products', 'products'), getDivider('divider3')],
  //     ),
  //     getItem(
  //       'Settings',
  //       'settings',
  //       <div className="min-w-[19px]">
  //         <SettingIcon />
  //       </div>,
  //       [getItem('Account', 'account')],
  //     ),
  //   );
  // }
  // }

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrentPath(e.key);

    router.push(`${(urlPage as any)[e.key]}`);
  };

  return !authenticatedRoutes.includes(pathname) ? (
    status !== 'authenticated' ? ( //fix
      <CustomLayout className={`h-screen w-full`}>
        {/* {session?.user && ( */}
        <Header
          className="w-screen bg-white h-[57px] flex items-center justify-between border-b border-solid border-red-100"
          style={{ padding: 0, background: '#fff' }}
        >
          <div className="flex items-center justify-between">
            <ConfigProvider
              theme={{
                components: {
                  Breadcrumb: {
                    itemColor: 'grey',
                    lastItemColor: '#131c16',
                    separatorColor: 'grey',
                    // colorFill: '#131c16',
                  },
                  Button: {
                    textHoverBg: 'white',
                  },
                },
              }}
            >
              <Button
                type="text"
                icon={isMobile && !collapsed ? <CloseOutlinedIcon /> : <MenuOutlinedIcon />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 29,
                }}
              />

              <Breadcrumb
                className={`breadcrumb-customized ${isMobile ? '--mobile' : ''} font-medium ${
                  collapsed ? '' : 'md:ml-[206px]'
                } !min-w-[225px] !text-2xl`}
                items={[
                  {
                    title: capitalize(ITEMS.find((item) => item.value === currentPath)?.label) || '',
                  },
                ]}
              />
            </ConfigProvider>
          </div>

          <div className="flex gap-2 justify-center items-center shrink-0 mr-[25px]">
            <Image
              priority
              className="cursor-pointer hidden md:block"
              src="/assets/icons/logo.svg"
              alt="logo"
              width={148}
              height={29}
              onClick={() => router.push('/')}
            />
            {/* {session?.user && session?.user.role === 'Administrator' && ( */}
            <div className="text-[14px] font-bold text-black ml-5 hidden md:block">
              {/* {session?.user.name?.toUpperCase()} */} Vy Nguyen
            </div>
            {/* )}  */}
            <Avatar className="cursor-pointer bg-white text-black-500 mr-4" size={38}>
              {/* {session?.user.name[0].toUpperCase()} */}
            </Avatar>
          </div>
        </Header>
        {/* )} */}
        <CustomLayout className="bg-yellow-50">
          {isMobile ? (
            <Drawer
              width={225}
              rootClassName="customized-drawer"
              placement="left"
              open={!collapsed}
              onClose={() => setCollapsed(true)}
            >
              <Sider width={225} className="!bg-white overflow-y-auto">
                <MenuSingle currentPath={currentPath} items={items} onClick={onClick} />
              </Sider>
            </Drawer>
          ) : (
            <Sider
              width={!collapsed ? 225 : 0}
              className="!bg-white overflow-y-auto transition-[width] ease-in-out delay-500"
            >
              <MenuSingle currentPath={currentPath} items={items} onClick={onClick} />
            </Sider>
          )}
          <div
            className={`${
              isMobile ? `mb-[-15px] h-full ${firstPath !== 'kitchen-display' && `bg-white`}` : `p-5 `
            }  app-body w-full overflow-y-auto`}
          >
            {children}
          </div>
        </CustomLayout>
      </CustomLayout>
    ) : (
      <LoadingIndicator />
    )
  ) : (
    <div className="h-screen"> {children}</div>
  );
};

export default Layout;
