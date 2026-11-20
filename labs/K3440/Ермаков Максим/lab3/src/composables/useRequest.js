import { ref, shallowRef, watch } from 'vue'

// Каждая загрузка привязана к параметрам и жизненному циклу страницы.
export function useRequest(load, sources = []) {
  const data = shallowRef(null)
  const error = shallowRef(null)
  const loading = ref(true)
  const revision = ref(0)

  watch([...sources, revision], async (_, __, onCleanup) => {
    const request = new AbortController()
    onCleanup(() => request.abort())
    loading.value = true
    error.value = null
    try {
      const result = await load(request.signal)
      if (!request.signal.aborted) data.value = result
    } catch (failure) {
      if (!request.signal.aborted) error.value = failure
    } finally {
      if (!request.signal.aborted) loading.value = false
    }
  }, { immediate: true })

  function reload() {
    revision.value += 1
  }

  return { data, error, loading, reload }
}
