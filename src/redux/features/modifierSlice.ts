import { getModifierSearch, removeModifierSearch } from '@/utils/localStorage';
import { createSlice } from '@reduxjs/toolkit';

type ModifierState = {
  modifier_search: string;
};

const initialState = {
  modifier_search: getModifierSearch(),
} as ModifierState;

export const modifier = createSlice({
  name: 'modifier',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.modifier_search = action.payload;
      localStorage.setItem('modifier_search', action.payload);
    },
    removeSearch: (state) => {
      state.modifier_search = '';
      removeModifierSearch();
    },
  },
});

export const { setSearch, removeSearch } = modifier.actions;
export default modifier.reducer;
