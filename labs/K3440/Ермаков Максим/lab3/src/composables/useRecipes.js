import { computed, toValue } from 'vue'
import { apiRequest } from '../api/client'
import { useRequest } from './useRequest'

function normalize(value) {
  return value.trim().toLowerCase().replaceAll('ё', 'е')
}

export function useRecipes(filters, limit) {
  const request = useRequest(signal => {
    const { type, difficulty } = toValue(filters)
    return apiRequest('/recipes', {
      params: { type: type || undefined, difficulty: difficulty || undefined, _limit: limit },
      signal,
    })
  }, [() => toValue(filters).type, () => toValue(filters).difficulty])

  const recipes = computed(() => {
    const { query = '', ingredients = '' } = toValue(filters)
    const term = normalize(query)
    const products = normalize(ingredients).split(',').map(item => item.trim()).filter(Boolean)
    return (request.data.value || []).filter(recipe => {
      const names = normalize(recipe.ingredients.map(([name]) => name).join(' '))
      return (!term || normalize(recipe.title).includes(term) || names.includes(term))
        && products.every(product => names.includes(product))
    })
  })

  return { ...request, recipes }
}
