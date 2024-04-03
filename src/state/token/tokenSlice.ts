import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const API_URL = 'http://localhost:5000'

const fetchToken = createAsyncThunk('/fetchToken', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/token`)
    if (!response.ok) {
      throw new Error('Failed to fetch token')
    }
    const data = await response.json()
    return { token: data.token }
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

interface InitialState {
  token: string | null
  loading: boolean
  error: unknown
}

const initialState: InitialState = {
  token: null,
  loading: false,
  error: null,
}

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchToken.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchToken.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.error = null
      })
      .addCase(fetchToken.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export { fetchToken }

export const selectToken = (state) => state.token.token

export default tokenSlice.reducer
