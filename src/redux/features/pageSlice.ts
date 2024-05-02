import { getURLPages, removeURLPages } from './../../utils/localStorage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PageState = {
  products?: string;
  bills?: string;
  'kitchen-display'?: string;
  'sales-summary'?: string;
  'sales-by-item'?: string;
  modifiers?: string;
  ' menu-categories'?: string;
  groups?: string;
  discounts?: string;
  tables?: string;
  employees?: string;
  accounts?: string;
  feedbacks?: string;
};

const initialState: PageState = getURLPages() || {
  products: '/products',
  bills: '/bills',
  'kitchen-display': '/kitchen-display',
  'sales-summary': '/sales-summary',
  'sales-by-item': '/sales-by-item',
  modifiers: '/modifiers',
  'menu-categories': '/menu-categories',
  groups: '/groups',
  discounts: '/discounts',
  tables: '/tables',
  employees: '/employees',
  account: '/account',
  feedbacks: '/feedbacks',
};

export const URLPages = createSlice({
  name: 'URLPages',
  initialState,
  reducers: {
    resetURLPages: () => {
      removeURLPages();
      return initialState;
    },
    updateURLPages: (state, action: PayloadAction<Partial<PageState>>) => {
      const newState = { ...state, ...action.payload };
      localStorage.setItem('URLPages', JSON.stringify(newState));
      return newState;
    },
  },
});

export const { resetURLPages, updateURLPages } = URLPages.actions;
export default URLPages.reducer;
