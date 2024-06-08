import { employee } from './features/employeeSlice';
import menuFilterReducer from '@/redux/features/menuFilterSlice';
import tableReducer from '@/redux/features/tableSlice';
import basketReducer from './features/basketSlice';
import billReducer from './features/billSlice';
import employeeReducer from './features/employeeSlice';
import modifierReducer from './features/modifierSlice';
import URLPages from './features/pageSlice';
import queryParams from './features/queryParamsSlice';
import { billApi } from './services/billApi';
import { diningTableApi } from './services/tableApi';
import { modifierApi } from './services/modifierApi';
import { productApi } from './services/productApi';
import { configureStore } from '@reduxjs/toolkit';
import { employeeApi } from './services/employeeApi';
import { categoryApi } from './services/categoryApi';
import { discountApi } from './services/discountApi';
import { loginApi } from './services/loginApi';
import { kdsApi } from './services/kds';
import { groupApi } from './services/groupApi';
import { summaryApi } from './services/summary';
import { feedbackApi } from './services/feedbackApi';

export const makeStore = () => {
  return configureStore({
    reducer: {
      basketReducer,
      tableReducer,
      menuFilterReducer,
      billReducer,
      employeeReducer,
      modifierReducer,
      URLPages,
      queryParams,
      [employeeApi.reducerPath]: employeeApi.reducer,
      [productApi.reducerPath]: productApi.reducer,
      [modifierApi.reducerPath]: modifierApi.reducer,
      [categoryApi.reducerPath]: categoryApi.reducer,
      [discountApi.reducerPath]: discountApi.reducer,
      [diningTableApi.reducerPath]: diningTableApi.reducer,
      [loginApi.reducerPath]: loginApi.reducer,
      [billApi.reducerPath]: billApi.reducer,
      [kdsApi.reducerPath]: kdsApi.reducer,
      [groupApi.reducerPath]: groupApi.reducer,
      [summaryApi.reducerPath]: summaryApi.reducer,
      [feedbackApi.reducerPath]: feedbackApi.reducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({}).concat([
        employeeApi.middleware,
        productApi.middleware,
        modifierApi.middleware,
        categoryApi.middleware,
        discountApi.middleware,
        diningTableApi.middleware,
        loginApi.middleware,
        billApi.middleware,
        kdsApi.middleware,
        groupApi.middleware,
        summaryApi.middleware,
        feedbackApi.middleware,
      ]),
  });
};

// setupListeners(store.dispatch);
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
