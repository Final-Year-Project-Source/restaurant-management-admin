import { createSlice } from '@reduxjs/toolkit';
import {
  getProductCategoryFilter,
  getProductGroupFilter,
  getProductStockFilter,
  removeProductCategoryFilter,
  removeProductGroupFilter,
  removeProductStockFilter,
} from '../../utils/localStorage';

type ProductState = {
  product_category_filter: any;
  product_group_filter: any;
  product_stock_filter: any;
};

const initialState = {
  product_category_filter: getProductCategoryFilter(),
  product_group_filter: getProductGroupFilter(),
  product_stock_filter: getProductStockFilter(),
} as ProductState;

export const employee = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    updateCategoryFilter: (state, action) => {
      state.product_category_filter = action.payload;
      localStorage.setItem('product_category_filter', JSON.stringify(action.payload));
    },
    removeCategoryFilter: (state) => {
      state.product_category_filter = [];
      removeProductCategoryFilter();
    },
    updateGroupFilter: (state, action) => {
      state.product_group_filter = action.payload;
      localStorage.setItem('product_group_filter', JSON.stringify(action.payload));
    },
    removeGroupFilter: (state) => {
      state.product_group_filter = [];
      removeProductGroupFilter();
    },
    updateStockFilter: (state, action) => {
      state.product_stock_filter = action.payload;
      localStorage.setItem('product_stock_filter', JSON.stringify(action.payload));
    },
    removeStockFilter: (state) => {
      state.product_stock_filter = [];
      removeProductStockFilter();
    },
  },
});

export const {} = employee.actions;
export default employee.reducer;
