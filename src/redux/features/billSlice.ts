import { createSlice } from '@reduxjs/toolkit';
import {
  getBillSearch,
  removeBillSearch,
  getBillOrderStatus,
  removeBillOrderStatus,
  getBillPaymentStatus,
  removeBillPaymentStatus,
  getBillStartTimeFilter,
  getBillEndTimeFilter,
  removeBillStartTimeFilter,
  removeBillEndTimeFilter,
} from '../../utils/localStorage';

type BillState = {
  bill_search: any;
  bill_order_status: any;
  bill_payment_status: any;
  bill_start_time_filter: any;
  bill_end_time_filter: any;
};

const initialState = {
  bill_search: getBillSearch(),
  bill_order_status: getBillOrderStatus(),
  bill_payment_status: getBillPaymentStatus(),
  bill_start_time_filter: getBillStartTimeFilter(),
  bill_end_time_filter: getBillEndTimeFilter(),
} as BillState;

export const bill = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.bill_search = action.payload;
      localStorage.setItem('bill_search', action.payload);
    },
    removeSearch: (state) => {
      state.bill_search = '';
      removeBillSearch();
    },
    updateOrderStatus: (state, action) => {
      state.bill_order_status = action.payload;
      localStorage.setItem('bill_order_status', JSON.stringify(action.payload));
    },
    removeOrderStatus: (state) => {
      state.bill_order_status = [];
      removeBillOrderStatus();
    },
    updatePaymentStatus: (state, action) => {
      state.bill_payment_status = action.payload;
      localStorage.setItem('bill_payment_status', JSON.stringify(action.payload));
    },
    removePaymentStatus: (state) => {
      state.bill_payment_status = [];
      removeBillPaymentStatus();
    },
    setStartTimeFilter: (state, action) => {
      state.bill_start_time_filter = action.payload;
      localStorage.setItem('bill_start_time_filter', action.payload);
    },
    removeStartTimeFilter: (state) => {
      state.bill_start_time_filter = '';
      removeBillStartTimeFilter();
    },
    setEndTimeFilter: (state, action) => {
      state.bill_end_time_filter = action.payload;
      localStorage.setItem('bill_end_time_filter', action.payload);
    },
    removeEndTimeFilter: (state) => {
      state.bill_end_time_filter = '';
      removeBillEndTimeFilter();
    },
  },
});

export const {
  setSearch,
  removeSearch,
  updateOrderStatus,
  removeOrderStatus,
  updatePaymentStatus,
  removePaymentStatus,
  removeEndTimeFilter,
  removeStartTimeFilter,
  setEndTimeFilter,
  setStartTimeFilter,
} = bill.actions;
export default bill.reducer;
