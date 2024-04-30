'use client';
import Button from '@/components/adminPage/Button';
import InputText from '@/components/adminPage/Input';
import DraggableTable from '@/components/draggableTable';
import { ArrowLeftIcon1, DeleteOutlinedIcon } from '@/components/Icons';
import TextGroup from '@/components/textGroup';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { useAddModifierMutation } from '@/redux/services/modifierApi';
import { ModifierOption } from '@/types/modifiers.types';
import { FOOTER_HEIGHT_SAVE, HEADER_LAYOUT, PADDING_TOP_TO_SCROLL } from '@/utils/constants';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ColumnsType } from 'antd/es/table';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import '../modifier.scss';

const AddModifier = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const discountBodyRef = useRef<HTMLDivElement>(null);

  const [addModifier, { isLoading: isAddLoading }] = useAddModifierMutation();
  const [modifierName, setModifierName] = useState('');
  const [modifierOptions, setModifierOptions] = useState<ModifierOption[]>([{ key: 1, name: '', price: 0 }]);

  const { isMobile, height } = useWindowDimensions();

  const { scrollBottom } = useScrollbarState(discountBodyRef, [modifierOptions?.length]);

  const modifierColumns: ColumnsType<ModifierOption> = [
    {
      title: 'Lựa chọn',
      dataIndex: 'option',
      render: (text, record) => (
        <TextGroup
          nameValue={record?.name}
          disabled={isAddLoading}
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

  const isEmptyName = useMemo(
    () => modifierOptions.some((option: { name: string; price: number }) => !option.name.trim()),
    [modifierOptions],
  );
  const handleSubmit = () => {
    const data = {
      name: modifierName.trim(),
      modifier_options: modifierOptions.map((option) => ({ name: option?.name.trim(), price: option?.price })),
    };

    addModifier({ access_token: session?.user?.access_token || '', data: data })
      .unwrap()
      .then(() => {
        router.push('/modifiers');
      })
      .catch((error) => toast.error(error.data.message));
  };

  return (
    <div
      ref={discountBodyRef}
      style={{ height: isMobile ? `calc(${height}px - ${FOOTER_HEIGHT_SAVE}px - ${HEADER_LAYOUT}px)` : 'auto' }}
      className="bg-white md:pt-[25px] md:pb-[30px] pb-[10px] pt-5 rounded-2xl md:max-w-[594px] md:relative overflow-y-auto"
    >
      {/* Header */}
      <Button
        className="w-[142px] md:ml-[25px] ml-5"
        variant="primary"
        icon={<ArrowLeftIcon1 />}
        disabled={isAddLoading}
        onClick={() => router.back()}
      >
        Trở lại
      </Button>

      {/* Save Button */}
      <div
        className={`z-10 md:h-[50px] h-[101px] max-md:px-[20px] absolute md:top-[25px] md:right-[25px] right-1/2 max-md:transform max-md:translate-x-1/2 bottom-0 md:min-w-[136px] w-full md:w-auto max-md:py-5 max-md:bg-white ${
          scrollBottom > PADDING_TOP_TO_SCROLL ? 'shadow-medium-top' : ''
        }`}
      >
        <Button
          className="w-full max-md:!max-h-[61px] h-[61px]"
          variant="secondary"
          type="submit"
          disabled={isAddLoading || !modifierName.trim() || isEmptyName || !modifierOptions?.length}
          onClick={handleSubmit}
        >
          Lưu
        </Button>
      </div>

      <div className="pt-[30px] flex flex-col space-y-[10px]">
        <div className="md:mx-[25px] mx-5 flex flex-col space-y-2">
          <InputText
            className="md:max-w-[253px]"
            label="Tên"
            placeholder="name"
            required
            disabled={isAddLoading}
            value={modifierName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setModifierName(e.target.value);
            }}
          />
        </div>

        <DraggableTable
          className="scroll-bar"
          columns={modifierColumns}
          data={modifierOptions}
          handleDragEnd={handleDragEnd}
        />

        <div className="flex justify-center pt-[10px]">
          <Button type="button" className="w-[177px]" onClick={handleAddOption}>
            + Thêm lựa chọn
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddModifier;
