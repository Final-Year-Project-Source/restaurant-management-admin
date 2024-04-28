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
      subTitle="Xin lỗi, trang bạn truy cập hiện không tồn tại."
      extra={
        <div className="flex justify-center">
          <Button className="!w-[200px]" onClick={() => router.push('/')}>
            Trở về trang chủ
          </Button>
        </div>
      }
    />
  );
};

export default NotFound;
