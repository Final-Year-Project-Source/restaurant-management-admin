import { Skeleton } from 'antd';
import Image from 'next/image';
import { FC, useState } from 'react';

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  classNameImage?: string;
}

const ProductImage: FC<Props> = ({ src, alt, width, height, className }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [srcURL, setSrcURL] = useState(src);
  const dimensionImage = {
    width,
    height,
  };

  return (
    <div className={`${className || ''} flex flex-col items-center shrink-0 relative`} style={dimensionImage}>
      {loading && (
        <Skeleton.Avatar shape="square" className="absolute top-0 left-0" size={width} style={dimensionImage} active />
      )}
      <Image
        priority
        onLoad={() => setLoading(false)}
        onError={() => {
          setSrcURL('/assets/images/product-default.png');
          setLoading(false);
        }}
        width={width}
        height={height}
        src={srcURL ? srcURL : '/assets/images/product-default.png'}
        alt={alt}
        style={{ opacity: loading ? 0 : 1 }}
      />
    </div>
  );
};

export default ProductImage;
