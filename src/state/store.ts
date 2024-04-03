import { configureStore } from '@reduxjs/toolkit'
import drawerReducer from './drawer/drawerSlice'
import articleReducer from './article/articleSlice'
import tokenReducer from './token/tokenSlice'

const store = configureStore({
  reducer: {
    drawer: drawerReducer,
    article: articleReducer,
    token: tokenReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
