import { reactive, readonly, ref, watch } from 'vue'
import { apiRequest } from '../api/client'
import { useFeedback } from './useFeedback'
import { useSession } from './useSession'

const collections = reactive({ authors: [], likes: [], saved: [], following: [] })
const pending = reactive(new Set())
const loading = ref(true)
const error = ref('')
const revision = ref(0)
const fields = { likes: 'recipeId', saved: 'recipeId', following: 'authorId' }
const { session } = useSession()
const { requireLogin, showNotice } = useFeedback()

export function initializeKitchen() {
  watch([session, revision], async ([account], previous, onCleanup) => {
    const request = new AbortController()
    onCleanup(() => request.abort())
    if (account !== previous?.[0]) {
      collections.saved = []
      collections.following = []
    }
    loading.value = true
    error.value = ''
    const names = account ? ['authors', 'likes', 'saved', 'following'] : ['authors', 'likes']
    try {
      const responses = await Promise.all(names.map(name => apiRequest('/' + name, {
        signal: request.signal,
        auth: name === 'saved' || name === 'following',
      })))
      if (request.signal.aborted) return
      names.forEach((name, i) => { collections[name] = responses[i] })
    } catch (failure) {
      if (!request.signal.aborted) error.value = failure.message
    } finally {
      if (!request.signal.aborted) loading.value = false
    }
  }, { immediate: true, flush: 'sync' })
}

function authorById(id) {
  return collections.authors.find(author => String(author.id) === String(id)) ?? {
    id,
    name: 'Автор рецепта',
    about: 'Делится домашними рецептами',
  }
}

function findReaction(collection, id, userId) {
  return collections[collection].find(entry =>
    entry.userId === userId && String(entry[fields[collection]]) === String(id))
}

function hasReaction(collection, id) {
  return Boolean(findReaction(collection, id, session.value?.user.id))
}

function likeCount(recipe) {
  return (Number(recipe.likes) || 0)
    + collections.likes.filter(entry => String(entry.recipeId) === String(recipe.id)).length
}

function actionPending(collection, id) {
  return pending.has(`${collection}:${id}`) || Boolean(session.value && (loading.value || error.value))
}

async function toggleReaction(collection, id) {
  if (!requireLogin() || actionPending(collection, id)) return
  const account = session.value
  const userId = account.user.id
  const key = `${collection}:${id}`
  const existing = findReaction(collection, id, userId)
  pending.add(key)

  try {
    if (existing) {
      await apiRequest(`/${collection}/${existing.id}`, { method: 'DELETE' })
      if (account === session.value) {
        collections[collection] = collections[collection].filter(entry => entry.id !== existing.id)
      }
    } else {
      const field = fields[collection]
      const record = await apiRequest('/' + collection, {
        method: 'POST',
        data: { userId, [field]: field === 'authorId' ? Number(id) : String(id) },
      })
      if (account === session.value) collections[collection].push(record)
    }
  } catch (failure) {
    if (account === session.value) {
      if ([404, 409].includes(failure.status)) revision.value += 1
      showNotice(failure.message)
    }
  } finally {
    pending.delete(key)
  }
}

export function useKitchen() {
  return {
    collections: readonly(collections),
    loading: readonly(loading),
    error: readonly(error),
    retry: () => { revision.value += 1 },
    authorById,
    hasReaction,
    likeCount,
    actionPending,
    toggleReaction,
  }
}
