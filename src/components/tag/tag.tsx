'use client';
import { FC } from 'react';
import './tag.scss';
interface Props {
  className?: string;
  text: string;
  variant?: 'disable' | 'active' | 'warning';
}

const Tag: FC<Props> = ({ className, text, variant = 'active' }) => {
  return <div className={`${className || ''} ${variant} tag font-open-sans `}>{text}</div>;
};

export default Tag;
