import { createSlice } from '@reduxjs/toolkit';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import {
  getFilerDietaryRestrictions,
  removeFilerDietaryRestrictions,
  getFilerProtein,
  removeFilerProtein,
} from '@/utils/localStorage';
type MenuFilterState = {
  protein: CheckboxValueType[];
  dietaryRestrictions: CheckboxValueType[];
};

const initialState: MenuFilterState = {
  protein: getFilerProtein() as CheckboxValueType[],
  dietaryRestrictions: getFilerDietaryRestrictions() as CheckboxValueType[],
};

export const menuFilter = createSlice({
  name: 'menuFilter',
  initialState,
  reducers: {
    updateProtein: (state, action) => {
      state.protein = action.payload;
      localStorage.setItem('protein', JSON.stringify(action.payload));
    },
    updateDietaryRestrictions: (state, action) => {
      state.dietaryRestrictions = action.payload;
      localStorage.setItem('dietaryRestrictions', JSON.stringify(action.payload));
    },
    resetMenuFilter: (state) => {
      state.protein = [];
      state.dietaryRestrictions = [];
      removeFilerDietaryRestrictions();
      removeFilerProtein();
    },
  },
});
export const { updateProtein, updateDietaryRestrictions, resetMenuFilter } = menuFilter.actions;
export default menuFilter.reducer;
