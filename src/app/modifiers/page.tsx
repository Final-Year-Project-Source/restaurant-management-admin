'use client';
import Button from '@/components/adminPage/Button';
import SearchInput from '@/components/adminPage/SearchInput';
import DraggableTable from '@/components/draggableTable';
import { updateURLPages } from '@/redux/features/pageSlice';
import { updateQueryParams } from '@/redux/features/queryParamsSlice';
import { useDragModifierMutation, useGetModifiersQuery } from '@/redux/services/modifierApi';
import { RootState } from '@/redux/store';
import { ModifierOption, ModifierType } from '@/types/modifiers.types';
import { serializeFilters } from '@/utils/commonUtils';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ColumnsType } from 'antd/es/table';
import { debounce } from 'lodash';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import './modifier.scss';

export default function Modifier() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [dataSource, setDataSource] = useState<ModifierType[]>([]);
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const queryParams = useSelector((state: RootState) => state.queryParams.modifiers);

  const { data: session } = useSession();
  const access_token = session?.user?.access_token || '';

  const searchUrl = searchParams.get('search') || '';
  const [dragModifier, isLoading] = useDragModifierMutation();
  const { data: allModifiers, isFetching } = useGetModifiersQuery({ search: queryParams?.search || '' });
  const Modifiers = allModifiers?.data;

  useEffect(() => {
    let URL = '/modifiers?';

    URL += serializeFilters({
      search: queryParams?.search || '',
    });

    router.push(URL);
  }, [queryParams?.search]);

  useEffect(() => {
    if (searchParams) {
      setIsOpenSearch(!!queryParams?.search);
      dispatch(
        updateQueryParams({
          key: 'modifiers',
          value: {
            ...queryParams,
            search: searchUrl || '',
          },
        }),
      );

      dispatch(updateURLPages({ modifiers: `/modifiers?${searchParams}` }));
    }
  }, [searchParams]);

  const data =
    Modifiers &&
    Modifiers.map((modifier: ModifierType, index: number) => ({
      key: index + 1,
      id: modifier.id,
      name: modifier.name,
      position: modifier.position,
      modifier_options: modifier.modifier_options,
    }));

  useEffect(() => {
    if (Array.isArray(data)) {
      setDataSource(data);
    }
  }, [Modifiers]);

  useEffect(() => {
    if (!dataSource.length) return;
    dragModifier({ data: { listModifier: dataSource }, access_token })
      .unwrap()
      .then(() => {})
      .catch((err) => toast.error(err?.data?.message));
  }, [dataSource]);

  const columns: ColumnsType<ModifierType> = [
    {
      title: 'Modifiers',
      dataIndex: 'name',
      render: (text, record) => (
        <div className="flex flex-col h-[38px] justify-center font-open-sans">
          <label className="text-[13px]">{record.name}</label>
          {record.modifier_options && (
            <span className="text-black-250 text-[11px] truncate">
              {record.modifier_options.map((modifier: ModifierOption) => modifier?.name).join(', ')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'sort',
      width: 20,
    },
  ];

  const handleUpdateParamsToURL = (values: { [key: string]: any }) => {
    dispatch(updateQueryParams({ key: 'modifiers', value: values }));
  };

  const debouncedHandleSearch = debounce((value: string) => {
    handleUpdateParamsToURL({ search: value.trim() });
  }, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedHandleSearch(e.target?.value);
  };

  const handleClickRow = (record: any) => {
    router.push(`modifiers/edit?id=${record?.id}`);

    return {};
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((previous: any) => {
        const activeIndex = previous.findIndex((i: any) => i.key === active.id);
        const overIndex = previous.findIndex((i: any) => i.key === over?.id);
        return arrayMove(previous, activeIndex, overIndex);
      });
    }
  };

  return (
    <div className="flex flex-col space-y-[10px] md:max-w-[594px] w-full bg-white rounded-2xl">
      <div className="flex items-center justify-center space-x-[10px] md:px-[25px] md:pt-[25px] px-5 pt-5">
        <SearchInput
          className={`search-animation ${isOpenSearch ? 'active' : ''}`}
          placeholder=""
          isOpenSearch={isOpenSearch}
          onChange={handleSearch}
          defaultValue={searchUrl}
          height={38}
          toggleSearch={() => setIsOpenSearch((prev) => !prev)}
        />
        <Button
          className="max-w-[177px]"
          variant="secondary"
          disabled={isFetching}
          onClick={() => router.push(`modifiers/add`)}
        >
          + New modifier
        </Button>
      </div>
      <DraggableTable
        className="border-bottom"
        columns={columns}
        data={dataSource}
        isLoading={isFetching}
        handleDragEnd={handleDragEnd}
        handleClickRow={handleClickRow}
      />
    </div>
  );
}
