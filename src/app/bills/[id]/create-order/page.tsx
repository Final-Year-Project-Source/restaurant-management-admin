'use client';
import Button from '@/components/adminPage/Button';
import { ArrowLeftIcon1 } from '@/components/Icons';
import Basket from '@/components/user-app-components/basket';
import Menu from '@/components/user-app-components/Menu';

import { useWindowDimensions } from '@/hooks/useWindowDimensions';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CreateOrder = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { isMobile } = useWindowDimensions();
  const [isOpenBasket, setIsOpenBasket] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(true);

  return (
    <main className="flex bg-white rounded-2xl p-[25px] space-x-[6px] h-full overflow-hidden">
      <div className="flex flex-col space-y-[24px] w-1/2">
        <Button className={`w-[198px] ${isMobile && 'hidden'}`} icon={<ArrowLeftIcon1 />} onClick={() => router.back()}>
          Cancel
        </Button>
        <div
          className={`rounded-2xl md:border-[0.5px] border-black-500 flex flex-col h-full pt-[13px] md:pt-[30px] md:pb-3`}
        >
          {!isMobile && <div className="font-medium text-xl text-center">Basket</div>}
          <Basket
            bill_id={id}
            isMobile={isMobile}
            isOpenBasket={isOpenBasket}
            setIsOpenBasket={setIsOpenBasket}
            setIsOpenMenu={setIsOpenMenu}
          />
        </div>
      </div>

      <div className="w-1/2">
        <Menu
          isMobile={isMobile}
          setIsOpenBasket={setIsOpenBasket}
          isOpenMenu={isOpenMenu}
          bill_id={id}
          setIsOpenMenu={setIsOpenMenu}
        />
      </div>
    </main>
  );
};

export default CreateOrder;
