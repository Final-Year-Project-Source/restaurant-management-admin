import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Rubik } from 'next/font/google';
const rubik = Rubik({ subsets: ['latin', 'arabic', 'cyrillic', 'hebrew', 'cyrillic-ext'], variable: '--font-rubik' });
import StyledComponentsRegistry from '@/libs/AntdRegistry';
import { Providers } from '@/redux/providers';
import Provider from '@/app/Provider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { open_sans } from '@/utils/fontUtils';
import Layout from '@/components/layout';
import ProtectedRouter from '@/components/adminPage/ProtectedRouter';
import { ConfigProvider } from 'antd';

export const metadata: Metadata = {
  title: 'Bella Olonje Admin',
  description: 'Management',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${open_sans.variable} h-screen bg-white overflow-hidden text-black-500`}>
        <Provider>
          <StyledComponentsRegistry>
            <ToastContainer />
            <Providers>
              <ProtectedRouter>
                <ConfigProvider
                  theme={{
                    token: {
                      fontFamily: 'var(--font-opens)',
                    },
                  }}
                >
                  <Layout>{children}</Layout>
                </ConfigProvider>
              </ProtectedRouter>
              {/* {children} */}
            </Providers>
          </StyledComponentsRegistry>
        </Provider>
      </body>
    </html>
  );
}
