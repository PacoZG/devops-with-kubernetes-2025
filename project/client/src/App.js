import React from 'react'
import TodoList from './components/TodoList'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <TodoList />
      </div>
    </QueryClientProvider>
  )
}

export default App
