import { createSlice } from '@reduxjs/toolkit';
import { getEmployeeRoleFilter, removeEmployeeRoleFilter } from '../../utils/localStorage';

type EmployeeState = {
  employee_role_filter: any;
};

const initialState = {
  employee_role_filter: getEmployeeRoleFilter(),
} as EmployeeState;

export const employee = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    updateRoleFilter: (state, action) => {
      state.employee_role_filter = action.payload;
      localStorage.setItem('employee_role_filter', JSON.stringify(action.payload));
    },
    removeRoleFilter: (state) => {
      state.employee_role_filter = [];
      removeEmployeeRoleFilter();
    },
  },
});

export const { updateRoleFilter, removeRoleFilter } = employee.actions;
export default employee.reducer;
