'use client';
import { ConfigProvider, Tabs, TabsProps } from 'antd';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const items: TabsProps['items'] = [
  {
    key: 'login',
    label: 'Đăng nhập',
  },
  {
    key: 'register',
    label: 'Đăng ký',
  },
];

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  // const session = await getServerSession(options);
  const path = usePathname();
  const router = useRouter();
  console.log({ path });

  const onChange = (key: string) => {
    router.push(`/${key}`);
  };

  // if (!session)
  return (
    <div className="flex h-full items-center justify-center">
      <div className="rounded-2xl bg-white sm:shadow-2xl flex flex-col justify-center items-center min-w-[500px] max-sm-w-full ">
        <Image priority src={'/assets/icons/mini-logo.svg'} alt="logo" width={150} height={150} />
        <ConfigProvider
          theme={{
            components: {
              Tabs: {
                itemSelectedColor: '#FA4A0C',
                itemHoverColor: 'rgba(19, 28, 22, 0.5)',
                itemActiveColor: 'rgba(19, 28, 22, 0.5)',
                inkBarColor: '#FA4A0C',
              },
            },
          }}
        >
          <Tabs
            className="w-full"
            defaultActiveKey={path.slice(1) || 'login'}
            centered
            items={items}
            onChange={onChange}
          />
        </ConfigProvider>
        {children}
      </div>
    </div>
  );
  // else session?.user?.role === 'Administrator' ? redirect('/employees') : redirect('/bills');
};

export default AuthLayout;
