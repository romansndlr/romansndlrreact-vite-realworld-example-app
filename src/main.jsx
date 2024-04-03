import React from 'react'
import ReactDOM from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { createServer } from 'miragejs'
import { Provider as ReduxProvider } from 'react-redux'
import axios from 'axios'
import store from './state/store'
import App from './App'
import makeServer from './server'

if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = 'https://api.realworld.io/api'
}

const defaultQueryFn = async ({ queryKey }) => {
  const { data } = await axios.get(queryKey[0], { params: queryKey[1] })
  return data
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 300000,
    },
  },
})

if (window.Cypress && process.env.NODE_ENV === 'test') {
  const cyServer = createServer({
    routes() {
      ;['get', 'put', 'patch', 'post', 'delete'].forEach((method) => {
        this[method]('/*', (schema, request) => window.handleFromCypress(request))
      })
    },
  })
  cyServer.logging = false
} else if (process.env.NODE_ENV === 'development') {
  makeServer({ environment: 'development' })
}

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} containerElement="div" />
      </ReduxProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
