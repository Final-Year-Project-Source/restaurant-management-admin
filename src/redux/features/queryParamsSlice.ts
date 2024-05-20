import { getQueryParams } from '@/utils/localStorage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type QueryParamsState = {
  products: {
    categories: string[];
    groups: string[];
    stocks: string[];
    page: number;
    limit: number;
    search: string;
    visited: boolean;
  };
  bills: {
    search: string;
    page: number;
    limit: number;
    startTime: string;
    endTime: string;
    orderStatus: string[];
    paymentStatus: string[];
  };
  'kitchen-display': { search: string; startTime: string; endTime: string; orders: string[]; groups: string[] };
  modifiers: { search: string };
  'sales-summary': {
    page: number;
    limit: number;
    startTime: string;
    endTime: string;
    startHourFilter: number;
    endHourFilter: number;
  };
  feedbacks: {
    page: number;
    limit: number;
    startTime: string;
    endTime: string;
  };
  'sales-by-item': {
    search: string;
    page: number;
    limit: number;
    startTime: string;
    endTime: string;
    categories: string[];
  };
  'menu-categories': { search: string; page: number; limit: number };
  groups: { search: string; page: number; limit: number };
  tables: { page: number; limit: number };
  employees: { page: number; limit: number; roleFilter: string[]; visited: boolean };
  feedbacks: {
    page: number;
    limit: number;
    startTime: string;
    endTime: string;
  };
};

export const DEFAULT_QUERY_PARAMS = {
  products: {
    categories: [],
    groups: [],
    stocks: [],
    search: '',
    page: 1,
    limit: 10,
    visited: false,
  },
  bills: { search: '', limit: 10, startTime: '', endTime: '', orderStatus: [], paymentStatus: [], page: 1 },
  'kitchen-display': { search: '', endTime: '', startTime: '', groups: [], orders: [] },
  modifiers: { search: '' },
  feedbacks: {
    page: 1,
    limit: 10,
    startTime: startDateDefault.toISOString(),
    endTime: endDateDefault.toISOString(),
  },
  'sales-summary': {
    page: 1,
    limit: 10,
    startTime: '',
    endTime: '',
    startHourFilter: 0,
    endHourFilter: 24,
  },
  'sales-by-item': { search: '', page: 1, limit: 10, startTime: '', endTime: '', categories: [] },
  'menu-categories': { search: '', page: 1, limit: 10 },
  groups: { search: '', page: 1, limit: 10 },
  tables: { page: 1, limit: 10 },
  employees: { limit: 10, roleFilter: [], page: 1, visited: false },
  feedbacks: {
    page: 10,
    limit: 1,
    startTime: '',
    endTime: '',
  },
};

const fallbackInitialState: QueryParamsState = DEFAULT_QUERY_PARAMS;

const initialState: QueryParamsState = getQueryParams() || fallbackInitialState;

export const queryParams = createSlice({
  name: 'queryParams',
  initialState,
  reducers: {
    resetQueryParams: () => initialState,
    updateQueryParams: (state, action: PayloadAction<{ key: keyof QueryParamsState; value: any }>) => {
      const { key, value } = action.payload;
      const updatedField = state[key] ? { ...state[key], ...value } : value;
      const newState = {
        ...state,
        [key]: updatedField,
      };
      localStorage.setItem('queryParams', JSON.stringify(newState));
      return newState;
    },
  },
});

export const { resetQueryParams, updateQueryParams } = queryParams.actions;
export default queryParams.reducer;
