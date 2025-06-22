import axios from 'axios'
import { baseUrl } from '../utils/config.js'

const getAllTodos = async () => {
  const response = await axios({
    method: 'GET',
    url: `${baseUrl}/api/todos`,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}

const createTodo = async todo => {
  const response = await axios.post(`${baseUrl}/api/todos`, todo)
  return response.data
}

export { getAllTodos, createTodo }
