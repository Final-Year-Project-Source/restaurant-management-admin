import { Empty, EmptyProps } from 'antd';
import { NoResultIcon } from '../Icons';
import './noResult.scss';

const NoResult: React.FC<EmptyProps> = ({ ...restProps }) => {
  return (
    <Empty
      {...restProps}
      className="empty-customized"
      image={<NoResultIcon />}
      description={<span className="font-open-sans text-[13px] text-black-500">Không tìm thấy dữ liệu</span>}
    />
  );
};

export default NoResult;
