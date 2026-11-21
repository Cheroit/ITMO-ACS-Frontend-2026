function normalize(value) {
  return value.trim().toLowerCase().replaceAll('ё', 'е');
}

function isPositiveInteger(value) {
  return typeof value === 'string' && /^\d+$/.test(value)
    && Number.isSafeInteger(Number(value)) && Number(value) > 0;
}

function getCatalogPage(recipes, params) {
  const { query = '', ingredients = '', type = '', difficulty = '', page = '1', limit = '12' } = params;
  if ([query, ingredients, type, difficulty].some(value => typeof value !== 'string')
    || query.length > 100 || ingredients.length > 200
    || !isPositiveInteger(page) || !isPositiveInteger(limit) || Number(limit) > 24) {
    return null;
  }

  const term = normalize(query);
  const products = normalize(ingredients).split(',').map(product => product.trim()).filter(Boolean);
  const matches = recipes.filter(recipe => {
    if ((type && recipe.type !== type) || (difficulty && recipe.difficulty !== difficulty)) return false;
    if (!term && products.length === 0) return true;

    const names = recipe.ingredients.map(([name]) => normalize(name));
    const hasIngredient = product => names.some(name => name.includes(product));
    return (!term || normalize(recipe.title).includes(term) || hasIngredient(term))
      && products.every(hasIngredient);
  });

  const total = matches.length;
  const pageSize = Number(limit);
  const currentPage = Math.min(Number(page), Math.max(1, Math.ceil(total / pageSize)));
  const start = (currentPage - 1) * pageSize;
  const cards = matches.slice(start, start + pageSize).map(recipe => {
    const { id, userId, title, image, type, difficulty, time, likes } = recipe;
    return { id, userId, title, image, type, difficulty, time, likes };
  });
  return { recipes: cards, total, page: currentPage, pageSize };
}

module.exports = { getCatalogPage };
