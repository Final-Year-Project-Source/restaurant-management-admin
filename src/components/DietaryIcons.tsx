import Image from 'next/image';
import React from 'react';

interface IconProps {
  iconName: string;
}

const Icon: React.FC<IconProps> = ({ iconName }) => {
  let iconSource = '';
  let optionText = false;

  switch (iconName.toLowerCase()) {
    case 'vegan':
      iconSource = '/assets/icons/dietaryRestrictionIcons/vegan.svg';
      break;
    case 'vegan option':
      iconSource = '/assets/icons/dietaryRestrictionIcons/vegan-option.svg';
      optionText = true;
      break;
    case 'vegetarian':
      iconSource = '/assets/icons/dietaryRestrictionIcons/vegetarian.svg';
      break;
    case 'vegetarian option':
      iconSource = '/assets/icons/dietaryRestrictionIcons/vegetarian-option.svg';
      optionText = true;
      break;
    case 'diary-free':
      iconSource = '/assets/icons/dietaryRestrictionIcons/diary-free.svg';
      break;
    case 'diary-free option':
      iconSource = '/assets/icons/dietaryRestrictionIcons/diary-free-option.svg';
      optionText = true;
      break;
    case 'gluten-free':
      iconSource = '/assets/icons/dietaryRestrictionIcons/gluten-free.svg';
      break;
    case 'gluten-free option':
      iconSource = '/assets/icons/dietaryRestrictionIcons/gluten-free-option.svg';
      optionText = true;
      break;
    default:
      return null;
  }

  return <Image priority src={iconSource} alt={iconName} width={19} height={optionText ? 26 : 19} />;
};

export default Icon;
