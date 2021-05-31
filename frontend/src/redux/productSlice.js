import { createSlice } from '@reduxjs/toolkit';

export const productSlice = createSlice({
  name: 'product',
  initialState: {
    prices: [],
    images: []
  },
  reducers: {
    addPrices: (state, action) => {
      state.prices = state.prices.concat(action.payload)
    },
    addImages: (state, action) => {
      state.images = state.images.concat(action.payload)
    }
  },
})

// Action creators are generated for each case reducer function
export const { addPrices, addImages } = productSlice.actions;

export default productSlice.reducer;