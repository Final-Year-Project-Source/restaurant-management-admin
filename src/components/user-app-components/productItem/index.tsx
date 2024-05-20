'use client';
import React from 'react';
import CountButton from '@/components/button/CountButton';
import { open_sans } from '@/utils/fontUtils';
import { formatPrice } from '@/utils/commonUtils';
import ProductImage from '@/components/productImage';
import Tag from '@/components/tag/tag';

interface ItemsProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  discountPrice?: number;
  className?: string;
  track_stock: boolean;
}

const ProductItem: React.FC<ItemsProps> = ({
  id,
  name,
  description,
  price,
  image_url,
  discountPrice,
  className,
  track_stock,
}) => {
  return (
    <div className={`${className || ''} ${(!track_stock && 'opacity-50') || ''} flex w-full`}>
      <ProductImage className="mr-[24px]" width={86} height={86} src={image_url} alt={name} />
      <div className="flex flex-col w-full">
        <div className="text-[14px] text-black-400 text-start">{name}</div>
        <div
          className={`text-[11px] text-start text-black-500 mt-[7px] ${open_sans.className}`}
          dangerouslySetInnerHTML={{ __html: description || '' }}
        />
        <div className="flex items-center justify-between mt-[9px] flex-wrap">
          {(discountPrice! < price && (
            <div className="flex space-x-[3px]">
              <div className="text-[14px] text-black-400 line-through">{formatPrice(price)}</div>
              <div className="text-[14px] text-black-500">{formatPrice(discountPrice || 0)}</div>
            </div>
          )) || <div className="text-[14px] text-black-400">{formatPrice(price)}</div>}
          <div className="flex space-x-[10px]">
            {!track_stock && <Tag className="!w-full" text="Out of stock"></Tag>}
            {track_stock && (
              <CountButton
                className="btn--add-to-basket"
                id={`btn--add_${id}`}
                plus={true}
                variant="secondary"
                disabled={!track_stock}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
