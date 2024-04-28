import { createSlice } from '@reduxjs/toolkit';
import { getTableId, removeTableId } from '../../utils/localStorage';

type TableState = {
  tableId: any;
};

const initialState = {
  tableId: getTableId(),
} as TableState;

export const table = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setTable: (state, action) => {
      state.tableId = action.payload;
      localStorage.setItem('table_id', action.payload);
    },
    removeTable: (state) => {
      state.tableId = '';
      removeTableId();
    },
  },
});

export const { setTable, removeTable } = table.actions;
export default table.reducer;
