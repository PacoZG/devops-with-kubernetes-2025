import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllTodos, createTodo } from '../services/todos'

export const useTodos = () => {
  return useQuery({ queryKey: ['todos'], queryFn: getAllTodos })
}

// Not in use yet
//TODO: Will be enabled in a future exercise
export const useCreateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      void queryClient.invalidateQueries(['todos']) // Refetch todos
    },
  })
}
