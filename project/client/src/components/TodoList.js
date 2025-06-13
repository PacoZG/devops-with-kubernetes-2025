import React from 'react'
import { useTodos } from '../hooks/useTodos'

const TodoList = () => {
  const { data: todos = [], isLoading, isError } = useTodos()

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error loading todos</p>

  console.log(todos)
  return (
    <div className="TodoList">
      {todos.map(todo => (
        <div className="todo" key={todo.id}>
          <p className="text">
            {`Task: `}
            <span className="span">{todo.text}</span>
          </p>
          <p className="status">
            {`Status: `}
            <span className="span">{todo.status}</span>
          </p>
        </div>
      ))}
    </div>
  )
}

export default TodoList
