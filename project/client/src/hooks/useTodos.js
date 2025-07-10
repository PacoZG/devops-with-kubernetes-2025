import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllTodos, createTodo, updateTodo } from '../services/handleTodos'

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

const updateTodoMutation = id => {
  return updateTodo(id)
}

export const useUpdateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTodoMutation,
    onSuccess: () => {
      void queryClient.invalidateQueries(['todos'])
    },
    onError: () => {
      console.log('something went wrong')
    },
  })
}
