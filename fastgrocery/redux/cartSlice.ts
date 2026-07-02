import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ICartItem {
  grocery: string; // ID of the grocery item
  name: string;
  price: string;
  unit: string;
  image: string;
  quantity: number;
}

export interface ICartState {
  cartData: ICartItem[];
  subTotal: number;
  deliveryFee: number;
  finalTotal: number;
}

const initialState: ICartState = {
  cartData: [],
  subTotal: 0,
  deliveryFee: 0,
  finalTotal: 0,
};

const calculateCartTotals = (state: ICartState) => {
  let subTotal = 0;
  state.cartData.forEach((item) => {
    subTotal += parseFloat(item.price) * item.quantity;
  });

  // Delivery fee: Free (₹0) if subtotal is greater than 100, else ₹40. If cart is empty, fee is 0.
  let deliveryFee = 0;
  if (subTotal > 0) {
    deliveryFee = subTotal > 100 ? 0 : 40;
  }

  state.subTotal = subTotal;
  state.deliveryFee = deliveryFee;
  state.finalTotal = subTotal + deliveryFee;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        _id: string;
        name: string;
        price: string;
        unit: string;
        image: string;
      }>
    ) => {
      const { _id, name, price, unit, image } = action.payload;
      const existingItem = state.cartData.find((item) => item.grocery === _id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartData.push({
          grocery: _id,
          name,
          price,
          unit,
          image,
          quantity: 1,
        });
      }

      calculateCartTotals(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const groceryId = action.payload;
      state.cartData = state.cartData.filter((item) => item.grocery !== groceryId);
      calculateCartTotals(state);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ groceryId: string; quantity: number }>
    ) => {
      const { groceryId, quantity } = action.payload;
      const item = state.cartData.find((i) => i.grocery === groceryId);

      if (item) {
        if (quantity <= 0) {
          state.cartData = state.cartData.filter((i) => i.grocery !== groceryId);
        } else {
          item.quantity = quantity;
        }
      }

      calculateCartTotals(state);
    },
    clearCart: (state) => {
      state.cartData = [];
      state.subTotal = 0;
      state.deliveryFee = 0;
      state.finalTotal = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
