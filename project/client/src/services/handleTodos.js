import axios from 'axios'
import { REACT_APP_SERVER_URL } from '../utils/config.js'

const API_BASE_URL = REACT_APP_SERVER_URL || '' // Fallback for local dev

const getAllTodos = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/todos`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch todos:', error)
    throw error
  }
}

const createTodo = async todo => {
  const response = await axios.post(`${API_BASE_URL}/api/todos`, todo)
  return response.data
}

export { getAllTodos, createTodo }
