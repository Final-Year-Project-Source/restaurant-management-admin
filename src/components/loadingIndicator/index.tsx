import { ConfigProvider, Spin } from 'antd';

const LoadingIndicator = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#131C16',
        },
      }}
    >
      <Spin
        className="z-[999] !absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 black-500"
        size="large"
      />
    </ConfigProvider>
  );
};

export default LoadingIndicator;
