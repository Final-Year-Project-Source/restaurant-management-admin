'use client';
import Button from '@/components/adminPage/Button';
import InputText from '@/components/adminPage/Input';
import DraggableTable from '@/components/draggableTable';
import CustomizedDrawer from '@/components/drawer';
import { ArrowLeftIcon1, DeleteOutlinedIcon } from '@/components/Icons';
import CustomizedModal from '@/components/modal';
import TextGroup from '@/components/textGroup';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import {
  useDeleteModifierMutation,
  useGetSingleModifierQuery,
  useUpdateModifierMutation,
} from '@/redux/services/modifierApi';
import { ModifierOption } from '@/types/modifiers.types';
import { FOOTER_HEIGHT_SAVE, HEADER_LAYOUT, PADDING_TOP_TO_SCROLL } from '@/utils/constants';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ColumnsType } from 'antd/es/table';
import { isEqual } from 'lodash';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import '../modifier.scss';

const EditModifier = () => {
  const router = useRouter();
  const { isMobile, width: screenWidth, height } = useWindowDimensions();
  const modifierContentRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;
  const { data: session } = useSession();
  const { data: singleModifier, isLoading } = useGetSingleModifierQuery({ id: id }, { skip: !id });
  const Modifiers = singleModifier?.data;
  const [updateModifier, { isLoading: isUpdateLoading }] = useUpdateModifierMutation();
  const [deleteModifier, { isLoading: isDeleteLoading }] = useDeleteModifierMutation();
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isChangedData, setIsChangedData] = useState(false);
  const [modifierName, setModifierName] = useState('');
  const [modifierOptions, setModifierOptions] = useState<ModifierOption[]>([{ key: 1, name: '', price: 0 }]);

  const { scrollBottom } = useScrollbarState(modifierContentRef, [modifierOptions?.length]);

  useEffect(() => {
    if (!Modifiers) return;
    setModifierName(Modifiers?.name);
    const ModifierOptions = Modifiers?.modifier_options.map((option: ModifierOption, index: number) => ({
      ...option,
      key: index + 1,
    }));
    setModifierOptions(ModifierOptions);
  }, [Modifiers]);

  useEffect(() => {
    if (!Modifiers || !modifierOptions) return;

    const modifierOptionsDataSource = modifierOptions.map((option: ModifierOption) => ({
      name: option?.name.trim(),
      price: option?.price,
    }));
    const modifierOptionOriginal = Modifiers?.modifier_options.map((option: ModifierOption) => ({
      name: option?.name.trim(),
      price: option?.price,
    }));

    const hasChanges =
      !isEqual(modifierOptionsDataSource, modifierOptionOriginal) || modifierName.trim() !== Modifiers?.name;

    setIsChangedData(hasChanges);
  }, [Modifiers, modifierOptions, modifierName]);

  const isEmptyName = useMemo(
    () => modifierOptions.some((option: { name: string; price: number }) => !option.name.trim()),
    [modifierOptions],
  );

  const modifierColumns: ColumnsType<ModifierOption> = [
    {
      title: 'Options',
      dataIndex: 'option',
      render: (text, record) => (
        <TextGroup
          nameValue={record?.name}
          disabled={isDeleteLoading || isUpdateLoading || isLoading}
          onChangeName={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeName(e.target.value, record.key)}
          onChangePrice={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChangePrice(parseFloat(e.target.value), record.key)
          }
          isInputPrice
          priceValue={record?.price}
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
            handleDeleteOption(record?.key);
          }}
        />
      ),
    },
    {
      key: 'sort',
      width: 20,
    },
  ];

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setModifierOptions((previous: any) => {
        const activeIndex = previous.findIndex((i: any) => i?.key === active.id);
        const overIndex = previous.findIndex((i: any) => i?.key === over?.id);
        return arrayMove(previous, activeIndex, overIndex);
      });
    }
  };

  const handleChangeName = (name: string, key: number) => {
    const updatedOptions = modifierOptions.map((option) => (option.key === key ? { ...option, name: name } : option));
    setModifierOptions(updatedOptions);
  };

  const handleChangePrice = (price: number, key: number) => {
    const updatedOptions = modifierOptions.map((option) => (option.key === key ? { ...option, price: price } : option));
    setModifierOptions(updatedOptions);
  };

  const handleAddOption = () => {
    const newOption: ModifierOption = { key: modifierOptions.length + 1, name: '', price: 0 };
    setModifierOptions([...modifierOptions, newOption]);
  };

  const handleDeleteOption = (key: number) => {
    const updatedOptions = modifierOptions.filter((option) => option.key !== key);
    setModifierOptions(updatedOptions);
  };

  const handleSubmit = (values: any) => {
    const data = {
      name: modifierName.trim(),
      modifier_options: modifierOptions.map((option) => ({
        name: option?.name.trim(),
        price: option?.price,
        _id: option?.id,
      })),
    };

    updateModifier({ access_token: session?.user?.access_token || '', id: id, data: data })
      .unwrap()
      .then((response) => {
        router.push('/modifiers');
      })
      .catch((error) => toast.error(error.data.message));
  };

  const handleOkDelete = () => {
    deleteModifier({ data: { id: id }, access_token: session?.user.access_token || '' })
      .unwrap()
      .then((response) => {
        setIsModalDeleteOpen(false);
        router.push('/modifiers');
      })
      .catch((error) => toast.error(error.data.message));
    setIsModalDeleteOpen(false);
  };

  return (
    <div
      ref={modifierContentRef}
      style={{ height: isMobile ? `calc(${height}px - ${FOOTER_HEIGHT_SAVE}px - ${HEADER_LAYOUT}px)` : 'auto' }}
      className="bg-white md:pt-[25px] md:pb-[30px] pb-[10px] pt-5 rounded-2xl md:max-w-[594px] md:relative overflow-y-auto"
    >
      <div className="flex items-center justify-between md:mr-[156px] md:px-[25px] px-5">
        <Button
          className="w-[142px] mr-2"
          variant="primary"
          icon={<ArrowLeftIcon1 />}
          onClick={() => router.back()}
          disabled={isDeleteLoading || isUpdateLoading || isLoading}
        >
          Back
        </Button>
        <Button
          className="w-[136px]"
          onClick={() => setIsModalDeleteOpen(true)}
          disabled={isDeleteLoading || isUpdateLoading || isLoading}
        >
          Delete
        </Button>
      </div>
      <div
        className={`z-10 md:h-[50px] h-[101px] max-md:px-[20px] absolute md:top-[25px] md:right-[25px] right-1/2 max-md:transform max-md:translate-x-1/2 bottom-0 md:min-w-[136px] w-full md:w-auto max-md:py-5 max-md:bg-white ${
          scrollBottom - PADDING_TOP_TO_SCROLL > 0 && isMobile ? 'shadow-medium-top' : ''
        }`}
      >
        <Button
          className={'w-full max-md:!max-h-[61px] h-[61px]'}
          variant="secondary"
          type="submit"
          onClick={handleSubmit}
          disabled={
            isDeleteLoading ||
            isUpdateLoading ||
            isLoading ||
            !isChangedData ||
            !modifierOptions?.length ||
            !modifierName ||
            isEmptyName
          }
        >
          Save
        </Button>
      </div>

      <div className="pt-[30px] flex flex-col space-y-[10px]">
        <div className="md:mx-[25px] mx-5 flex flex-col space-y-2">
          <InputText
            isLoading={isLoading}
            className="md:max-w-[253px]"
            label="Modifier name"
            placeholder="name"
            required
            disabled={isDeleteLoading || isUpdateLoading || isLoading}
            value={modifierName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setModifierName(e.target.value);
            }}
          />
        </div>
        {modifierOptions?.length > 0 && (
          <DraggableTable
            className="scroll-bar"
            columns={modifierColumns}
            data={modifierOptions}
            handleDragEnd={handleDragEnd}
            isLoading={isLoading}
          />
        )}

        <div className="flex justify-center pt-[10px] scroll-bar">
          <Button
            type="button"
            className="w-[177px]"
            onClick={handleAddOption}
            disabled={isDeleteLoading || isUpdateLoading || isLoading}
          >
            + Add option
          </Button>
        </div>
      </div>

      {isModalDeleteOpen && (
        <>
          <CustomizedModal
            className="customized-width"
            open={isModalDeleteOpen && !isMobile}
            title="Confirm deletion"
            onOk={handleOkDelete}
            okText="Delete"
            onCancel={() => setIsModalDeleteOpen(false)}
          >
            <div className="text-center text-black-400 flex flex-col mb-[30px]">
              <span>Are you sure you want to delete?</span> <span>This cannot be undone.</span>
            </div>
          </CustomizedModal>
          <CustomizedDrawer
            className="bill-drawer"
            type="confirm"
            open={isModalDeleteOpen && isMobile}
            onClose={() => setIsModalDeleteOpen(false)}
            title="Confirm deletion"
            okText="Delete"
            onOk={handleOkDelete}
            width={screenWidth}
          >
            <div className="text-center text-black-400 flex flex-col">
              <span>Are you sure you want to delete?</span> <span>This cannot be undone.</span>
            </div>
          </CustomizedDrawer>
        </>
      )}
    </div>
  );
};
export default EditModifier;
