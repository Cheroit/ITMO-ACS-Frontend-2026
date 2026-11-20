import axios from 'axios'
import { expireSession, useSession } from '../composables/useSession'

const client = axios.create({ baseURL: '/api', timeout: 10000 })
const { session } = useSession()
const messages = {
  'Email already exists': 'Этот email уже зарегистрирован.',
  'Cannot find user': 'Неверный email или пароль.',
  'Incorrect password': 'Неверный email или пароль.',
  'Email format is invalid': 'Проверьте адрес электронной почты.',
  'Password is too short': 'Пароль слишком короткий.',
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', data, params, signal, auth = true } = options
  const token = auth ? session.value?.accessToken : null
  try {
    const response = await client.request({
      url: path,
      method,
      data,
      params,
      signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    return response.data
  } catch (error) {
    if (axios.isCancel(error)) throw error
    const status = error.response?.status
    if (status === 401 && token) {
      expireSession(token)
      throw Object.assign(new Error('Время действия сессии истекло. Войдите снова.'), { status })
    }
    const body = error.response?.data
    const message = typeof body === 'string' && body && !body.trimStart().startsWith('<')
      ? messages[body] || body
      : status ? 'Не удалось выполнить запрос.' : 'Не удалось связаться с сервером. Попробуйте ещё раз.'
    throw Object.assign(new Error(message), { status })
  }
}
