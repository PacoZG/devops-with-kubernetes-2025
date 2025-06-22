import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllTodos, createTodo } from '../services/handleTodos'

export const useTodos = () => {
  return useQuery({ queryKey: ['todos'], queryFn: getAllTodos })
}

const createNewTodo = async todo => {
  return createTodo(todo)
}

export const useCreateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createNewTodo,
    onSuccess: () => {
      void queryClient.invalidateQueries(['todos']) // Refetch todos
    },
    onError: () => {
      console.log('something went wrong')
    },
  })
}
