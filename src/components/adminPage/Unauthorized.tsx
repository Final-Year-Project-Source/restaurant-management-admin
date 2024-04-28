'use client';
import React from 'react';
import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';
const Unauthorized: React.FC = () => {
  const router = useRouter();
  return (
    <Result
      status="403"
      title="403"
      subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
      extra={
        <Button onClick={() => router.push('/bills')} type="primary">
          Trở về trang hoá đơn
        </Button>
      }
    />
  );
};
export default Unauthorized;
