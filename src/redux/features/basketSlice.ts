import { OPERATOR } from '@/enums';
import { getBasket, removeBasket } from '@/utils/localStorage';
import { createSlice } from '@reduxjs/toolkit';
import { isEqual } from 'lodash';

type BasketState = {
  basket: any;
};

const initialState = {
  basket: getBasket(),
} as BasketState;

export const basket = createSlice({
  name: 'basket',
  initialState,
  reducers: {
    reset: (state) => {
      state.basket = null;
      removeBasket();
    },
    update: (state, action) => {
      // update local storage
      const basket: any = state.basket || { orderItems: [] };

      if (!action.payload) return;
      const { quantity, operator, product, notes, modifiers, dietary_restrictions } = action.payload as any;

      const indexItem = basket?.orderItems?.findIndex((o: any) => {
        return (
          o?.product?.id === product?.id &&
          isEqual(o?.dietary_restrictions || [], dietary_restrictions || []) &&
          isEqual(o?.notes || '', notes || '') &&
          isEqual(o?.modifiers || [], modifiers || [])
        );
      });

      if (indexItem > -1) {
        if (
          !modifiers ||
          isEqual(basket.orderItems[indexItem]?.modifiers, modifiers) ||
          !dietary_restrictions ||
          isEqual(basket.orderItems[indexItem]?.dietary_restrictions, dietary_restrictions) ||
          !notes ||
          isEqual(basket.orderItems[indexItem].notes, notes)
        ) {
          if (quantity === 0) {
            basket.orderItems.splice(indexItem, 1);
          } else {
            if (operator === OPERATOR.ADD) {
              basket.orderItems[indexItem].quantity += quantity;
            } else if (operator === OPERATOR.SUB) {
              basket.orderItems[indexItem].quantity -= quantity;
            } else if (operator === OPERATOR.EQUAL) {
              basket.orderItems[indexItem].quantity = quantity;
            }
          }
        } else {
          basket.orderItems.push({
            product,
            notes: notes || '',
            modifiers: modifiers || [],
            quantity: quantity,
            dietary_restrictions: dietary_restrictions || [],
          });
        }
      } else {
        basket.orderItems.push({
          product,
          notes: notes || '',
          modifiers: modifiers || [],
          quantity: quantity,
          dietary_restrictions: dietary_restrictions || [],
        });
      }
      const newBasket = { ...basket };
      localStorage.setItem('basket', JSON.stringify(newBasket));
      state.basket = newBasket;
    },
  },
});

export const { update: updateBasket, reset: resetBasket } = basket.actions;
export default basket.reducer;
