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
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button onClick={() => (window.location.href = '/bills')} type="primary">
          Back to Bill Page
        </Button>
      }
    />
  );
};
export default Unauthorized;
