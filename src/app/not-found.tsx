'use client';
import { Button } from '@/components/button';
import { Result } from 'antd';
import { useRouter } from 'next/navigation';

const NotFound = () => {
  const router = useRouter();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button variant="secondary" onClick={() => router.push('/')}>
          Back Home
        </Button>
      }
    />
  );
};

export default NotFound;
