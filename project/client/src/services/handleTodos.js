import axios from 'axios'
import { REACT_APP_SERVER_URL } from '../utils/config.js'

const baseUrl = REACT_APP_SERVER_URL
console.log({ baseUrl })

const getAllTodos = async () => {
  console.log(`Posting ToDo to ${baseUrl}/api/todos`)
  try {
    const response = await axios.get(`${baseUrl}/api/todos`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch todos:', error)
    throw error
  }
}

const createTodo = async todo => {
  console.log(`Posting ToDo to ${baseUrl}/api/todos`)
  const response = await axios.post(`${baseUrl}/api/todos`, todo)
  return response.data
}

export { getAllTodos, createTodo }
