'use client';
import Button from '@/components/adminPage/Button';
import DraggableTable from '@/components/draggableTable';
import { DeleteOutlinedIcon } from '@/components/Icons';
import TextGroup from '@/components/textGroup';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { useGetGroupsQuery, useUpdateGroupsMutation } from '@/redux/services/groupApi';
import { GroupType } from '@/types/groups.types';

import { FOOTER_HEIGHT_SAVE, HEADER_LAYOUT, PADDING_TOP_TO_SCROLL } from '@/utils/constants';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ColumnsType } from 'antd/es/table';
import { isEqual } from 'lodash';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const Group = () => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const { isMobile, height } = useWindowDimensions();

  const { data: session } = useSession();
  const { data: originalGroups, isFetching } = useGetGroupsQuery();
  const [updateGroups, { isLoading: isUpdateLoading }] = useUpdateGroupsMutation();

  const [isChangedData, setIsChangedData] = useState(false);
  const [groupsDataSource, setGroupsDataSource] = useState<GroupType[]>([]);
  const { scrollBottom } = useScrollbarState(bodyRef, [groupsDataSource?.length]);

  useEffect(() => {
    if (!originalGroups) return;
    const groups = originalGroups?.map((group: GroupType, index: number) => ({
      ...group,
      key: index + 1,
    }));
    setGroupsDataSource(groups);
  }, [originalGroups]);

  useEffect(() => {
    if (!originalGroups) return;
    const namesDataSource = groupsDataSource.map((group) => group.name.trim());
    const namesOriginal = originalGroups.map((group: GroupType) => group.name.trim());
    const isEmptyName = namesDataSource.some((name) => name === '');

    const hasChanges = !isEqual(namesDataSource, namesOriginal) && !isEmptyName;
    setIsChangedData(hasChanges);
  }, [groupsDataSource, originalGroups]);

  const groupColumns: ColumnsType<GroupType> = [
    {
      title: 'Groups',
      dataIndex: 'groups',
      render: (text, record) => (
        <TextGroup
          nameValue={record?.name}
          disabled={isUpdateLoading || isFetching}
          onChangeName={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeName(e.target.value, record)}
        />
      ),
    },
    {
      dataIndex: 'delete',
      width: 20,
      render: (text, record) => (
        <DeleteOutlinedIcon
          className="cursor-pointer"
          onClick={() => {
            handleDeleteGroup(record);
          }}
        />
      ),
    },
    {
      key: 'sort',
      width: 20,
    },
  ];

  const handleDeleteGroup = (record: GroupType) => {
    const updatedGroups = groupsDataSource.filter((group) => group.key !== record?.key);
    setGroupsDataSource(updatedGroups);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setGroupsDataSource((previous: any) => {
        const activeIndex = previous.findIndex((i: any) => i?.key === active.id);
        const overIndex = previous.findIndex((i: any) => i?.key === over?.id);
        return arrayMove(previous, activeIndex, overIndex);
      });
    }
  };

  const handleChangeName = (name: string, record: GroupType) => {
    const updatedGroups = groupsDataSource.map((group) =>
      group.key === record?.key ? { ...group, name: name } : group,
    );
    setGroupsDataSource(updatedGroups);
  };

  const handleAddGroups = () => {
    const newGroups: GroupType = { key: groupsDataSource.length + 1, name: '' };
    setGroupsDataSource([...groupsDataSource, newGroups]);
  };

  const handleSubmit = () => {
    if (!isChangedData) return;

    const newGroups = groupsDataSource?.map((group) => ({ id: group?.id, name: group?.name.trim() }));
    updateGroups({
      access_token: session?.user?.access_token || '',
      data: newGroups,
    })
      .unwrap()
      .then((response) => {
        setIsChangedData(false);
      })
      .catch((error) => toast.error(error.data.message));
  };

  return (
    <div
      ref={bodyRef}
      style={{ height: isMobile ? `calc(${height}px - ${FOOTER_HEIGHT_SAVE}px - ${HEADER_LAYOUT}px)` : 'auto' }}
      className="bg-white md:pt-[25px] md:pb-[30px] pb-[10px] rounded-2xl md:max-w-[594px] md:relative overflow-y-auto"
    >
      <div
        className={`z-10 md:h-[50px] h-[101px] max-md:px-[20px] absolute md:top-[25px] md:right-[25px] right-1/2 max-md:transform max-md:translate-x-1/2 bottom-0 md:min-w-[136px] w-full md:w-auto max-md:py-5 max-md:bg-white md:rounded-[30px] ${
          scrollBottom - PADDING_TOP_TO_SCROLL > 0 && isMobile ? 'shadow-medium-top' : ''
        }`}
      >
        <Button
          className={'w-full max-md:!max-h-[61px] h-[61px]'}
          variant="secondary"
          type="submit"
          onClick={handleSubmit}
          disabled={isUpdateLoading || isFetching || !isChangedData}
        >
          Save
        </Button>
      </div>

      <div className="md:pt-[60px] pt-[10px] flex flex-col space-y-[10px]">
        <DraggableTable
          className="scroll-bar"
          columns={groupColumns}
          data={groupsDataSource}
          handleDragEnd={handleDragEnd}
          isLoading={isFetching || isUpdateLoading}
        />

        <div className="flex justify-center pt-[10px] scroll-bar">
          <Button
            type="button"
            className="w-[177px]"
            onClick={handleAddGroups}
            disabled={isUpdateLoading || isFetching}
          >
            + Add group
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Group;
