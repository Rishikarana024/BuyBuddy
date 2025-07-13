import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createOrder, fetchAllOrders, updateOrder } from './orderAPI';

const initialState = {
  orders: [],
  status: 'idle',
  currentOrder: null,
  totalOrders: 0
};

// ✅ Create Order
export const createOrderAsync = createAsyncThunk(
  'order/createOrder',
  async (order, { rejectWithValue }) => {
    try {
      const response = await createOrder(order);
      console.log('🧾 Order API Response:', response);
      return response; // assuming response is already parsed JSON object
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      return rejectWithValue(error.response?.data || 'Unknown error');
    }
  }
);

// ✅ Update Order
export const updateOrderAsync = createAsyncThunk(
  'order/updateOrder',
  async (order, { rejectWithValue }) => {
    try {
      const response = await updateOrder(order);
      return response;
    } catch (error) {
      console.error('❌ Order update failed:', error);
      return rejectWithValue(error.response?.data || 'Unknown error');
    }
  }
);

// ✅ Fetch All Orders
export const fetchAllOrdersAsync = createAsyncThunk(
  'order/fetchAllOrders',
  async ({ sort, pagination }, { rejectWithValue }) => {
    try {
      const response = await fetchAllOrders(sort, pagination);
      return response;
    } catch (error) {
      console.error('❌ Fetch orders failed:', error);
      return rejectWithValue(error.response?.data || 'Unknown error');
    }
  }
);

// ✅ Slice
export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Create Order
      .addCase(createOrderAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        if (action.payload) {
          state.orders.push(action.payload);
          state.currentOrder = action.payload;
        }
      })
      .addCase(createOrderAsync.rejected, (state) => {
        state.status = 'idle';
        console.error('❌ Order creation failed');
      })

      // Fetch Orders
      .addCase(fetchAllOrdersAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllOrdersAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.totalOrders;
      })
      .addCase(fetchAllOrdersAsync.rejected, (state) => {
        state.status = 'idle';
      })

      // Update Order
      .addCase(updateOrderAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateOrderAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderAsync.rejected, (state) => {
        state.status = 'idle';
      });
  },
});

// ✅ Actions & Selectors
export const { resetOrder } = orderSlice.actions;

export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectOrders = (state) => state.order.orders;
export const selectTotalOrders = (state) => state.order.totalOrders;
export const selectStatus = (state) => state.order.status;

export default orderSlice.reducer;
