import { readonly, shallowRef } from 'vue'

const key = 'nk3-session'

function readSession() {
  try {
    const stored = localStorage.getItem(key) || sessionStorage.getItem(key)
    const value = JSON.parse(stored)
    return value?.accessToken && value?.user ? value : null
  } catch {
    return null
  }
}

const session = shallowRef(readSession())
const expired = shallowRef(0)

export function useSession() {
  return { session: readonly(session), expired: readonly(expired) }
}

export function clearSession() {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
  session.value = null
}

export function saveSession(value, remember) {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(key, JSON.stringify(value))
  session.value = value
}

export function expireSession(token) {
  if (session.value?.accessToken !== token) return
  clearSession()
  expired.value += 1
}
