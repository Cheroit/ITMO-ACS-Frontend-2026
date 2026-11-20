import { ref, shallowRef } from 'vue'
import { useSession } from './useSession'

const loginPrompt = ref(false)
const notice = shallowRef(null)

export function useFeedback() {
  const { session } = useSession()

  function requireLogin() {
    if (session.value) return true
    loginPrompt.value = true
    return false
  }

  function showNotice(message) {
    notice.value = { message }
  }

  return { loginPrompt, notice, requireLogin, showNotice }
}
