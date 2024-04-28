// skeleton-table.tsx

import { ConfigProvider, Skeleton, SkeletonProps, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';

export type SkeletonTableColumnsType = {
  key: string;
};

type SkeletonTableProps = SkeletonProps & {
  columns: ColumnsType<SkeletonTableColumnsType>;
  rowCount?: number;
};

export default function SkeletonTable({
  loading = false,
  active = false,
  rowCount = 5,
  columns,
  children,
  className,
}: SkeletonTableProps): JSX.Element {
  return loading ? (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'grey',
          controlOutlineWidth: 1,
        },
      }}
    >
      <Table
        rowKey="key"
        className={`scroll-bar border-bottom ${className || ''}`}
        pagination={false}
        dataSource={[...Array(rowCount)].map((_, index) => ({
          key: `key${index}`,
        }))}
        columns={columns.map((column) => {
          return {
            ...column,
            render: function renderPlaceholder() {
              return <Skeleton key={column.key} title active={active} paragraph={false} className={className} />;
            },
          };
        })}
      />
    </ConfigProvider>
  ) : (
    <>{children}</>
  );
}
