import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { selectToken } from '../token/tokenSlice'

const API_URL = 'http://localhost:5000'

const fetchLatestArticle = createAsyncThunk('article/fetchLatestArticle', async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState() // Pobierz aktualny stan
    const token = selectToken(state)

    const response = await fetch(`${API_URL}/latest-article`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch latest article')
    }
    const data = await response.json()
    return data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message)
  }
})

interface InitialState {
  latestArticle: unknown
  loading: boolean
  error: unknown
}

const initialState: InitialState = {
  latestArticle: null,
  loading: false,
  error: null,
}

const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    clearArticle: (state) => {
      state.latestArticle = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestArticle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLatestArticle.fulfilled, (state, action) => {
        state.loading = false
        state.latestArticle = action.payload.data
      })
      .addCase(fetchLatestArticle.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export { fetchLatestArticle }

export const { clearArticle } = articleSlice.actions

export const selectLatestArticle = (state) => state.article.latestArticle

export default articleSlice.reducer
