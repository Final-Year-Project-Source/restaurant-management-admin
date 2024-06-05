import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Skeleton, Table, TableProps } from 'antd';
import React from 'react';
import { MenuOutlinedIcon } from '../Icons';
import NoResult from '../noResult';
import './draggableTable.scss';

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string | number;
}

const Row = ({ children, ...props }: RowProps) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: 'relative' } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes} className="hover:bg-grey-100">
      {React.Children.map(children, (child) => {
        if ((child as React.ReactElement).key === 'sort') {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <div ref={setActivatorNodeRef} {...listeners}>
                <MenuOutlinedIcon
                  fill="#131c16"
                  className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  width={20}
                  height={14}
                />
              </div>
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

interface DraggableTableProp extends TableProps {
  data: any[];
  columns: any[];
  isLoading?: boolean;
  handleDragEnd?: ({ active, over }: DragEndEvent) => void;
  className?: string;
  handleClickRow?: (record: any) => void;
}

const DraggableTable: React.FC<DraggableTableProp> = ({
  data,
  columns,
  isLoading,
  handleDragEnd,
  className,
  handleClickRow,
}) => {
  const loadingSkeleton = Array.from({ length: 4 }, (_, index) => (
    <Skeleton.Input className="skeleton-input-customized" key={index} size="small" active block />
  ));
  const isEmpty = data.length === 0 && !isLoading;

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
      <SortableContext items={data?.map((i: any) => i.key)} strategy={verticalListSortingStrategy}>
        <Table
          className={`draggable-table ${className || ''}`}
          components={{
            body: {
              row: isEmpty
                ? () => (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-10">
                        <NoResult />
                      </td>
                    </tr>
                  )
                : Row,
            },
          }}
          rowKey="key"
          columns={columns}
          dataSource={isLoading ? [] : data}
          pagination={false}
          locale={{
            emptyText: isLoading ? <div className="space-y-4">{loadingSkeleton}</div> : <NoResult />,
          }}
          onRow={(record: any) => ({
            onClick: () => {
              if (handleClickRow) {
                handleClickRow(record);
              }
            },
          })}
        />
      </SortableContext>
    </DndContext>
  );
};

export default DraggableTable;
