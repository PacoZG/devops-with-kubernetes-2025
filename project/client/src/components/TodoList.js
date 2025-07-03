import React, { useState } from 'react'
import { useCreateTodo, useTodos } from '../hooks/useTodos'
import { capitalize } from 'lodash'
import { REACT_APP_SERVER_URL } from '../utils/config.js'

const TodoList = () => {
  const { data: todos = [], isLoading, isError } = useTodos()
  const createTodoMutation = useCreateTodo()
  const [text, setText] = useState('')

  if (isLoading) {
    return <p>Loading...</p>
  }
  if (isError) {
    return <p>Error loading todos</p>
  }

  const handleSubmit = () => {
    if (text.length < 10) {
      window.alert('Task text is too short!')
      return
    }
    const newTodo = {
      text: text,
    }
    void createTodoMutation.mutate(newTodo)

    console.log('[CLIENT]: Todo to create:', newTodo)
    setText('')
  }

  return (
    <div className="TodoList">
      <header className="TodoList__header">The Project App</header>

      <img
        src={`${REACT_APP_SERVER_URL}/api/image`}
        alt="Random"
        style={{
          width: '50rem',
          height: '50rem',
          marginBottom: '10px',
        }}
      />

      <div className="create-todo">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <input
            className={'todo-input'}
            maxLength={140}
            value={text}
            placeholder={'Type your todo task. (Press ⏎ or Click button to submit)'}
            onChange={event => {
              setText(event.target.value)
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                handleSubmit()
              }
            }}
          />

          <label
            style={{
              padding: '10px',
              color: text.length < 110 ? 'green' : text.length >= 135 ? 'red' : 'yellow',
            }}
          >{`${text.length}/140 Characters allowed`}</label>
        </div>

        <button className={'create-button'} onClick={handleSubmit}>
          Create todo
        </button>
      </div>

      {todos.map(todo => (
        <div className={`todo ${todo.status === 'done' ? 'done' : 'not-done'}`} key={todo.id}>
          <div className="text">
            {todo.text.includes('<a') ? (
              <>
                <div>{'Task: Read'}</div>
                <div dangerouslySetInnerHTML={{ __html: todo.text }} />
              </>
            ) : (
              <>
                <div>{'Task:'}</div>
                <div className="span">{todo.text}</div>
              </>
            )}
          </div>

          <div className="status">
            <div>{`Status: ${capitalize(todo.status.replace('-', ' '))}`}</div>
          </div>
        </div>
      ))}

      <footer className="TodoList__footer">DevOps With Kubernetes 2025</footer>
    </div>
  )
}

export default TodoList
