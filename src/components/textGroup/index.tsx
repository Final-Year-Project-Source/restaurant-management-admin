import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { string } from 'yup';
import InputText from '../adminPage/Input';

interface Props {
  nameValue?: string;
  priceValue?: string | number;
  onChangeName?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePrice?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  isInputPrice?: boolean;
}
const TextGroup: React.FC<Props> = ({
  nameValue,
  onChangeName,
  onChangePrice,
  priceValue = 0,
  disabled,
  isInputPrice = false,
}) => {
  const { isMobile } = useWindowDimensions();
  return (
    <div className="flex md:space-x-10 space-x-2.5 ">
      <div className="flex justify-center items-center space-x-5 md:max-w-[252px] max-md:max-w-[197px]">
        {!isMobile && <label className="text-[14px] font-rubik">Tên</label>}
        <InputText
          className="md:max-w-[194px]"
          placeholder="Tên"
          value={nameValue}
          onChange={onChangeName}
          disabled={disabled}
        />
      </div>

      {isInputPrice && (
        <div className="flex justify-center items-center space-x-5 md:max-w-[157px] max-md:max-w-[68px]">
          {!isMobile && <label className="text-[14px] font-rubik">Giá</label>}
          <InputText placeholder="Giá" value={priceValue || 0} onChange={onChangePrice} disabled={disabled} />
        </div>
      )}
    </div>
  );
};

export default TextGroup;
