import { lowerCase } from 'lodash';
import { GroupType } from '@/types/groups.types';
import { DiscountType } from './../types/discounts.types';
import { CategoryType } from '@/types/categories.types';
import { ModifierType } from '@/types/modifiers.types';
import { DiningTableType } from '@/types/tables.types';

export const DIETARY_RESTRICTIONS = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'diary-free', label: 'Diary-free' },
  { value: 'gluten-free option', label: 'Gluten-free Option' },
  { value: 'diary-free option', label: 'Diary-free Option' },
  { value: 'vegan option', label: 'Vegan Option' },
  { value: 'vegetarian option', label: 'Vegetarian Option' },
  { value: 'gluten-free', label: 'Gluten-free' },
];

export const PROTEINS = [
  { label: 'Chicken', value: 'chicken' },
  { label: 'Pork', value: 'pork' },
  { label: 'Beef', value: 'beef' },
  { label: 'Seafood', value: 'seafood' },
  { label: 'Other', value: 'other' },
];

export const DIETARY_RESTRICTIONS_GROUP = {
  groupName: 'Dietary restrictions',
  options: [
    { icon: 'Vegan', label: 'Vegan' },
    { icon: 'Vegetarian', label: 'Vegetarian' },
    { icon: 'Diary-free', label: 'Diary-free' },
    { icon: 'Gluten-free', label: 'Gluten-free' },
  ],
};
export const PROTEINS_GROUP = {
  groupName: 'Protein',
  options: [{ label: 'Chicken' }, { label: 'Pork' }, { label: 'Beef' }, { label: 'Seafood' }, { label: 'Other' }],
};

export const TYPES = [
  { label: 'Fixed amount', value: 'FIXED_AMOUNT' },
  { label: 'Fixed percent', value: 'FIXED_PERCENT' },
];

export const STATUS = [
  { label: 'Ordering', value: 'Ordering' },
  { label: 'Preparing', value: 'Preparing' },
  { label: 'Done', value: 'Done' },
];

export const STOCK_STATUSES = {
  IN_STOCK: 'In stock',
  LOW_STOCK: 'Low stock',
  OUT_OF_STOCK: 'Out of stock',
};

export const convertStocksToOptions = (stocks: { [key: string]: number }): { label: string; value: string }[] => {
  if (!stocks) return [];

  return [
    { label: `In stock`, value: 'in stock' },
    { label: `Low stock (${stocks?.[LOW_STOCK]})`, value: 'low stock' },
    { label: `Out of stock (${stocks?.[OUT_OF_STOCK]})`, value: 'out of stock' },
  ];
};

export const convertModifiersToOptions = (modifiers: ModifierType[] = []): { label: string; value: string }[] => {
  if (!Array.isArray(modifiers)) {
    return [];
  }

  return modifiers.map((modifier) => ({
    label: modifier.name,
    value: modifier.id.toString(),
    subTitle: modifier.modifier_options.map((option) => option.name).join(', '),
  }));
};

export const convertCategoriesToOptions = (
  categories: CategoryType[] = [],
  type?: string,
): { label: string; value: string }[] => {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.map((category) => ({
    label: category.name,
    value: type === 'id' ? category.id || '' : category?.name.replace(/\,/g, '*').toLowerCase() || '',
  }));
};

export const convertDiscountToOptions = (discountsList: DiscountType[] = []): { label: string; value: string }[] => {
  if (!Array.isArray(discountsList)) {
    return [];
  }

  return discountsList?.map((item: any) => ({
    label: item.type === 'FIXED_PERCENT' ? `${item.name} (${item.value}%)` : `${item.name} (${item.value} vnd)`,
    value: item.id,
  }));
};

export const convertGroupsToOptions = (groups: GroupType[] = [], type?: string): { label: string; value: string }[] => {
  if (!Array.isArray(groups)) {
    return [];
  }

  return groups.map((group) => ({
    label: group?.name || '',
    value: type === 'id' ? group?.id || '' : group?.name.toLowerCase() || '',
  }));
};

export const convertTablesToOptions = (tables: DiningTableType[] = []): { label: string; value: string }[] => {
  if (!Array.isArray(tables)) {
    return [];
  }
  return tables.map((table) => ({
    label: table.name,
    value: table.id.toString(),
  }));
};

export const getLabelById = (values: any[] | any, items: any[]) => {
  const filteredItems = items.filter((item) => values?.includes(item.value)).map((item) => item.label);
  return filteredItems || '';
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Ordering':
      return 'blue';
    case 'Preparing':
      return 'orange';
    case 'Done':
      return 'green';
    default:
      return 'red';
  }
};

export const BILL_STATUSES = [
  {
    id: 1,
    title: 'Order status',
    statuses: [
      { label: 'Ordering', value: 'ordering' },
      { label: 'Preparing', value: 'preparing' },
      { label: 'Partially completed', value: 'partially completed' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
  {
    id: 2,
    title: 'Payment status',
    statuses: [
      { label: 'Unpaid', value: 'unpaid' },
      { label: 'Paid', value: 'paid' },
      { label: 'Refunded', value: 'refunded' },
    ],
  },
];

export const KDS_STATUSES = [
  { label: 'Preparing', value: 'preparing' },
  { label: 'Completed', value: 'completed' },
];

export const ROLE_FILTER = [
  {
    id: 1,
    title: 'Roles',
    statuses: [
      { label: 'Standard', value: 'Standard' },
      { label: 'Manager', value: 'Manager' },
      { label: 'Administrator', value: 'Administrator' },
      { label: 'User', value: 'User' },
    ],
  },
];
export const ROLE_EMPLOYEE = [
  { label: 'Standard', value: 'Standard' },
  { label: 'Manager', value: 'Manager' },
  { label: 'Administrator', value: 'Administrator' },
  { label: 'User', value: 'User' },
];
export const ROWSPERPAGE = [
  { label: '10 per page', value: 10 },
  { label: '25 per page', value: 25 },
  { label: '50 per page', value: 50 },
  { label: '100 per page', value: 100 },
];
export const PAGINATIONLIMIT = [10, 25, 50, 100];

export const DEFAULT_ORDER_STATUSES = 'ordering,preparing,partially completed,completed,cancelled';
export const DEFAULT_ITEM_STATUSES = 'preparing,completed,cancelled';
export const DEFAULT_PAYMENT_STATUSES = 'paid,unpaid,refunded';
export const DEFAULT_ROLE_FILTER = ['Standard', 'Manager', 'Administrator', 'User'];
export const STICKY_HEADER_HEIGHT = 77;
export const FOOTER_HEIGHT = 85;
export const PADDING_TO_HEADER = 20;
export const DESKTOP_HEADER_HEIGHT = 109;
export const DESKTOP_FOOTER_HEIGHT = 57;
export const MENU_ITEMS = [
  { parent: 'orders', subs: ['bills', 'kitchen-display'] },
  { parent: 'reports', subs: ['sales-summary', 'sales-by-item'] },
  { parent: 'items', subs: ['products', 'modifiers', 'menu-categories', 'groups', 'discounts'] },
  { parent: 'settings', subs: ['tables', 'employees', 'account'] },
];

export const PREPARING = 'preparing';
export const COMPLETED = 'completed';
export const CANCELLED = 'cancelled';
export const LOW_STOCK = 'Low stock' || 'low stock';
export const OUT_OF_STOCK = 'Out of stock' || 'out of stock';

export const DEFAULT_PASSWORD = 'staff@123456';

//header layout
export const HEADER_LAYOUT = 57;
export const PADDING_BLOCK_CONTENT_LAYOUT = 40;

// ticket kds
export const SPACE_BETWEEN_ITEMS = 30;
export const PADDING_BOTTOM_HEIGHT = 50;
export const PADDING_BOTTOM_DIVIDE_HEIGHT = 65;
export const JAGGED_TOP_HEIGHT = 36;
export const JAGGED_BOTTOM_HEIGHT = 30;
export const FILTER_HEADER_HEIGHT = 200;

//table
export const TABLE_HEADER_HEIGHT = 147; // 62: table header , 85:filter header
export const TABLE_FOOTER_HEIGHT = 78;
export const TABLE_FOOTER_HEIGHT_ON_MOBILE = 146;

export const TABLE_PADDING_BLOCK = 40;

//menu category, group, modifier, discount
export const PADDING_TOP_TO_SCROLL = 10;
export const FOOTER_HEIGHT_SAVE = 101;
export const HEADER_HEIGHT_BUTTON = 50;
export const PADDING_HEADER_TO_BODY = 30;
export const PADDING_BOTTOM_TO_SCROLL = 20;

//menu page
export const PADDING_BOTTOM_MENU = 40;

export const LABEL_PREDICT_SENTIMENT = {
  POSITIVE: 'POSITIVE',
  NEGATIVE: 'NEGATIVE',
  NEUTRAL: 'NEUTRAL',
};

// export const startDateDefault = (() => {
//   const thisWeekStartDate = new Date();
//   const dayOfWeek = thisWeekStartDate.getDay();
//   const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Adjust for Sunday (0) being the start of the week
//   thisWeekStartDate.setDate(thisWeekStartDate.getDate() + diffToMonday);
//   thisWeekStartDate.setHours(0, 0, 0, 0);
//   return thisWeekStartDate;
// })();

// export const endDateDefault = (() => {
//   const thisWeekEndDate = new Date();
//   const dayOfWeek = thisWeekEndDate.getDay();
//   const diffToSunday = 7 - (dayOfWeek === 0 ? 7 : dayOfWeek); // Adjust for Sunday (0) being the start of the week
//   thisWeekEndDate.setDate(thisWeekEndDate.getDate() + diffToSunday);
//   thisWeekEndDate.setHours(23, 59, 59, 999);
//   return thisWeekEndDate;
// })();

export const startDateDefault = (() => {
  const thisWeekStartDate = new Date();
  thisWeekStartDate.setDate(thisWeekStartDate.getDate() - thisWeekStartDate.getDay() + 1);
  thisWeekStartDate.setHours(0, 0, 0, 0);
  return thisWeekStartDate;
})();

export const endDateDefault = (() => {
  const thisDate = new Date();
  thisDate.setHours(23, 59, 59, 59);
  return thisDate;
})();
