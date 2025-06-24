import axios from 'axios'
import { serverBaseUrl } from '../utils/config.js'

const getAllTodos = async () => {
  const response = await axios({
    method: 'GET',
    url: `${serverBaseUrl}/api/todos`,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}

const createTodo = async todo => {
  const response = await axios.post(`${serverBaseUrl}/api/todos`, todo)
  return response.data
}

export { getAllTodos, createTodo }
