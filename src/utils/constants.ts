import { lowerCase } from 'lodash';
import { GroupType } from '@/types/groups.types';
import { DiscountType } from './../types/discounts.types';
import { CategoryType } from '@/types/categories.types';
import { ModifierType } from '@/types/modifiers.types';
import { DiningTableType } from '@/types/tables.types';

export const ITEMS = [
  { value: 'bills', label: 'Hoá đơn' },
  { value: 'kitchen-display', label: 'Nhà bếp' },
  { value: 'sales-summary', label: 'Doanh thu' },
  { value: 'sales-by-item', label: 'Món ăn' },
  { value: 'products', label: 'Món ăn' },
  { value: 'modifiers', label: 'Lựa chọn' },
  { value: 'menu-categories', label: 'Danh mục' },
  { value: 'groups', label: 'Nhóm' },
  { value: 'discounts', label: 'Loại giảm giá' },
  { value: 'tables', label: 'Bàn ăn' },
  { value: 'employees', label: 'nhân viên' },
];

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
  { label: 'Gà', value: 'chicken' },
  { label: 'Lợn', value: 'pork' },
  { label: 'Bò', value: 'beef' },
  { label: 'Hải sản', value: 'seafood' },
  { label: 'Khác', value: 'other' },
];

export const DIETARY_RESTRICTIONS_GROUP = {
  groupName: 'Chế độ ăn kiêng',
  options: [
    { icon: 'Vegan', label: 'Vegan' },
    { icon: 'Vegetarian', label: 'Vegetarian' },
    { icon: 'Diary-free', label: 'Diary-free' },
    { icon: 'Gluten-free', label: 'Gluten-free' },
  ],
};

export const PROTEINS_GROUP = {
  groupName: 'Protein',
  options: [{ label: 'Gà' }, { label: 'Lơn' }, { label: 'Bò' }, { label: 'Hải sản' }, { label: 'Khác' }],
};

export const TYPES = [
  { label: 'Số lượng cố định', value: 'FIXED_AMOUNT' },
  { label: 'Phần trắm cố định', value: 'FIXED_PERCENT' },
];

export const STATUS = [
  { label: 'Đang đặt món', value: 'Ordering' },
  { label: 'Đang chuẩn bị', value: 'Preparing' },
  { label: 'Đã hoàn thành', value: 'Done' },
];

export const STOCK_STATUSES = {
  IN_STOCK: 'Còn hàng',
  LOW_STOCK: 'Thiếu hàng',
  OUT_OF_STOCK: 'Hết hàng',
};

export const convertStocksToOptions = (stocks: { [key: string]: number }): { label: string; value: string }[] => {
  if (!stocks) return [];

  return [
    { label: `Còn hàng`, value: 'in stock' },
    { label: `Thiếu hàng (${stocks?.[STOCK_STATUSES.LOW_STOCK]})`, value: 'low stock' },
    { label: `Hết hàng (${stocks?.[STOCK_STATUSES.OUT_OF_STOCK]})`, value: 'out of stock' },
  ];
};

export const convertModifiersToOptions = (modifiers: ModifierType[] = []): { label: string; value: string }[] => {
  if (!Array.isArray(modifiers)) {
    return [];
  }

  return modifiers.map((modifier) => ({
    label: modifier.name,
    value: modifier._id.toString(),
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
    value: type === 'id' ? category._id || '' : lowerCase(category?.name) || '',
  }));
};

export const convertDiscountToOptions = (discountsList: DiscountType[] = []): { label: string; value: string }[] => {
  if (!Array.isArray(discountsList)) {
    return [];
  }

  return discountsList?.map((item: any) => ({
    label: item.type === 'FIXED_PERCENT' ? `${item.name} (${item.value}%)` : `${item.name} (฿${item.value})`,
    value: item._id,
  }));
};

export const convertGroupsToOptions = (groups: GroupType[] = [], type?: string): { label: string; value: string }[] => {
  if (!Array.isArray(groups)) {
    return [];
  }

  return groups.map((group) => ({
    label: group?.name || '',
    value: type === 'id' ? group?._id || '' : lowerCase(group?.name) || '',
  }));
};

export const convertTablesToOptions = (tables: DiningTableType[] = []): { label: string; value: string }[] => {
  if (!Array.isArray(tables)) {
    return [];
  }
  return tables.map((table) => ({
    label: table.name,
    value: table._id.toString(),
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
      { label: 'Đang đặt món', value: 'ordering' },
      { label: 'Đang chuẩn bị', value: 'preparing' },
      { label: 'Hoàn thành một phần', value: 'partially completed' },
      { label: 'Đã hoàn thành', value: 'completed' },
      { label: 'Đã huỷ', value: 'cancelled' },
    ],
  },
  {
    id: 2,
    title: 'Payment status',
    statuses: [
      { label: 'Chưa thanh toán', value: 'unpaid' },
      { label: 'Đã thanh toán', value: 'paid' },
      { label: 'Đã hoàn lại', value: 'refunded' },
    ],
  },
];

export const KDS_STATUSES = [
  { label: 'Chuẩn bị', value: 'preparing' },
  { label: 'Hoàn thành', value: 'completed' },
];

export const ROLE_FILTER = [
  {
    id: 1,
    title: 'Chức vụ',
    statuses: [
      { label: 'Nhân viên', value: 'standard' },
      { label: 'Quản lý', value: 'manager' },
      { label: 'Admin', value: 'administrator' },
    ],
  },
];
export const ROLE_EMPLOYEE = [
  { label: 'Nhân viên', value: 'Standard' },
  { label: 'Quản lý', value: 'Manager' },
  { label: 'Admin', value: 'Administrator' },
];
export const ROWSPERPAGE = [
  { label: '10 hàng', value: 10 },
  { label: '25 hàng', value: 25 },
  { label: '50 hàng', value: 50 },
  { label: '100 hàng', value: 100 },
];
export const PAGINATIONLIMIT = [10, 25, 50, 100];

export const DEFAULT_ORDER_STATUSES = 'ordering,preparing,partially completed,completed,cancelled';
export const DEFAULT_ITEM_STATUSES = 'preparing,completed,cancelled';
export const DEFAULT_PAYMENT_STATUSES = 'paid,unpaid,refunded';
export const DEFAULT_ROLE_FILTER = ['standard', 'manager', 'administrator'];
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
