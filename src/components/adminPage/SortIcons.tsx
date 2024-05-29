import { CSSProperties } from 'react';
import { DownOutlinedIcon, DownOutlinedIconBlur, UpOutlinedIcon } from '../Icons';

export const SortArrows = (order: string, left?: string) => {
  const iconStyle: CSSProperties = { position: 'absolute', left: left || '64px' };
  switch (order) {
    case 'ascend':
      return (
        <div style={iconStyle}>
          <UpOutlinedIcon />
        </div>
      );
    case 'descend':
      return (
        <div style={iconStyle}>
          <DownOutlinedIcon />
        </div>
      );
    default:
      return (
        <div style={iconStyle}>
          <DownOutlinedIcon />
        </div>
      );
  }
};
