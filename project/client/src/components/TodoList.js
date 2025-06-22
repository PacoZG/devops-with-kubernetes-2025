import React from 'react'
import { useTodos } from '../hooks/useTodos'
import { capitalize } from 'lodash'
import { baseUrl } from '../utils/config.js'

const TodoList = () => {
  const { data: todos = [], isLoading, isError } = useTodos()

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error loading todos</p>

  console.log(todos)
  return (
    <div className="TodoList">
      <header className="TodoList__header">The Project App</header>

      <img
        src={`${baseUrl}/api/image`}
        alt="Random image"
        style={{ width: '50rem', height: '50rem', marginBottom: '10px' }}
      />

      {todos.map(todo => (
        <div className={`todo ${todo.status === 'done' ? 'done' : 'not-done'}`} key={todo.id}>
          <p className="text">
            {`Task: `}
            <span className="span">{todo.text}</span>
          </p>

          <p className="status">
            {`Status: `}
            <span className="span">{capitalize(todo.status.replace('-', ' '))}</span>
          </p>
        </div>
      ))}

      <footer className="TodoList__footer">DevOps With Kubernetes 2025</footer>
    </div>
  )
}

export default TodoList
