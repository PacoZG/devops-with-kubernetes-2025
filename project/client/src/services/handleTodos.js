import axios from 'axios'
import { baseUrl } from '../utils/config.js'

console.log('SERVER_URL: ', baseUrl)

const getAllTodos = async () => {
  const response = await axios({
    method: 'GET',
    url: `${baseUrl}/api/todos`,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  console.log(response.data)
  return response.data
}

const createTodo = async todo => {
  const response = await axios.post(baseUrl, todo)
  return response.data
}

export { getAllTodos, createTodo }
