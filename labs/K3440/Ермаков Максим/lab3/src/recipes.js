export const categories = ['Завтраки', 'Основные блюда', 'Супы', 'Десерты']
export const difficulties = ['Легко', 'Средне']
export const photos = {
  'pasta.jpg': 'Паста',
  'soup.jpg': 'Суп',
  'pizza.jpg': 'Пицца',
  'omelette.jpg': 'Омлет',
  'cupcakes.jpg': 'Кексы',
  'skewers.jpg': 'Шашлычки',
}

export function recipeImage(name) {
  return '/assets/images/' + (Object.hasOwn(photos, name) ? name : 'pasta.jpg')
}

export function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()
}
