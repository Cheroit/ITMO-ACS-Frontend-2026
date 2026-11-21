import { computed, toValue } from 'vue'
import { apiRequest } from '../api/client'
import { useRequest } from './useRequest'

const filterNames = ['query', 'ingredients', 'type', 'difficulty', 'page']

export function useRecipes(filters, limit) {
  const request = useRequest(signal => apiRequest('/catalog', {
    params: { ...toValue(filters), limit },
    signal,
  }), filterNames.map(name => () => toValue(filters)[name]))

  const recipes = computed(() => request.data.value?.recipes ?? [])
  return { ...request, recipes }
}
