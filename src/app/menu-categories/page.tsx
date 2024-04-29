'use client';
import Button from '@/components/adminPage/Button';
import DraggableTable from '@/components/draggableTable';
import { DeleteOutlinedIcon } from '@/components/Icons';
import TextGroup from '@/components/textGroup';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { useGetCategoriesQuery, useUpdateCategoryMutation } from '@/redux/services/categoryApi';

import { CategoryType } from '@/types/categories.types';
import { FOOTER_HEIGHT_SAVE, HEADER_LAYOUT, PADDING_TOP_TO_SCROLL } from '@/utils/constants';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ColumnsType } from 'antd/es/table';
import { isEqual } from 'lodash';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const MenuCategories = () => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const { isMobile, height } = useWindowDimensions();

  const { data: session } = useSession();
  const { data: categoriesData, isFetching } = useGetCategoriesQuery();
  const originalCategories = categoriesData?.data;
  const [updateCategories, { isLoading: isUpdateLoading }] = useUpdateCategoryMutation();

  const [isChangedData, setIsChangedData] = useState(false);
  const [categoriesDataSource, setCategoriesDataSource] = useState<CategoryType[]>([]);

  useEffect(() => {
    if (!originalCategories) return;
    const categories = originalCategories?.map((category: CategoryType, index: number) => ({
      ...category,
      key: index + 1,
    }));
    setCategoriesDataSource(categories);
  }, [originalCategories]);

  const { scrollBottom } = useScrollbarState(bodyRef, [categoriesDataSource?.length]);

  useEffect(() => {
    if (!originalCategories) return;
    const namesDataSource = categoriesDataSource.map((category) => category.name.trim());
    const namesOriginal = originalCategories.map((category: CategoryType) => category.name);
    const isEmptyName = namesDataSource.some((name) => name === '');

    const hasChanges = !isEqual(namesDataSource, namesOriginal) && !isEmptyName;
    setIsChangedData(hasChanges);
  }, [categoriesDataSource, originalCategories]);

  const categoryColumns: ColumnsType<CategoryType> = [
    {
      title: 'Danh mục',
      dataIndex: 'categories',
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
            handleDeleteCategory(record);
          }}
        />
      ),
    },
    {
      key: 'sort',
      width: 20,
    },
  ];

  const handleDeleteCategory = (record: CategoryType) => {
    const updatedCategories = categoriesDataSource.filter((category) => category.key !== record?.key);
    setCategoriesDataSource(updatedCategories);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setCategoriesDataSource((previous: any) => {
        const activeIndex = previous.findIndex((i: any) => i?.key === active.id);
        const overIndex = previous.findIndex((i: any) => i?.key === over?.id);
        return arrayMove(previous, activeIndex, overIndex);
      });
    }
  };

  const handleChangeName = (name: string, record: CategoryType) => {
    const updatedCategories = categoriesDataSource.map((category) =>
      category.key === record?.key ? { ...category, name: name } : category,
    );
    setCategoriesDataSource(updatedCategories);
  };

  const handleAddCategories = () => {
    const newCategories: CategoryType = { key: categoriesDataSource.length + 1, name: '' };
    setCategoriesDataSource([...categoriesDataSource, newCategories]);
  };

  const handleSubmit = () => {
    if (!isChangedData) return;

    const newCategories = categoriesDataSource?.map((category) => ({
      _id: category?._id,
      name: category?.name.trim(),
    }));
    updateCategories({
      access_token: session?.user?.access_token || '',
      data: newCategories,
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
          Lưu
        </Button>
      </div>

      <div className="md:pt-[60px] pt-[10px] flex flex-col space-y-[10px]">
        <DraggableTable
          className="scroll-bar"
          columns={categoryColumns}
          data={categoriesDataSource}
          handleDragEnd={handleDragEnd}
          isLoading={isFetching || isUpdateLoading}
        />

        <div className="flex justify-center pt-[10px] scroll-bar">
          <Button
            type="button"
            className="w-[177px]"
            onClick={handleAddCategories}
            disabled={isUpdateLoading || isFetching}
          >
            + Thêm danh mục
          </Button>
        </div>
      </div>
    </div>
  );
};
export default MenuCategories;
