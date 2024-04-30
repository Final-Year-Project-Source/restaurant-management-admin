import { Skeleton } from 'antd';
import './skeletonInput.scss';
interface SkeletonInputProps {
  className?: string;
}
export const SkeletonTicket: React.FC<SkeletonInputProps> = ({ className }) => {
  return (
    <div className={`skeleton-ticket ${className} animate-pulse `}>
      <div className={`skeleton-ticket-header animate-pulse`} />

      <div className={`skeleton-ticket-body animate-pulse`} />
    </div>
  );
};
