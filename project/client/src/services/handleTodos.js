import axios from 'axios'
import { REACT_APP_SERVER_URL } from '../utils/config.js'

const getAllTodos = async () => {
  const response = await axios({
    method: 'GET',
    url: `${REACT_APP_SERVER_URL}/api/todos`,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}

const createTodo = async todo => {
  const response = await axios.post(`${REACT_APP_SERVER_URL}/api/todos`, todo)
  return response.data
}

export { getAllTodos, createTodo }
