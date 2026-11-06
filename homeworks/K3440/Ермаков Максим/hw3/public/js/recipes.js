const recipeList = document.getElementById('recipeList');
const filterForm = document.getElementById('filterForm');
let searchNumber = 0;

function normalize(text) {
  return text.trim().toLowerCase().replaceAll('ё', 'е');
}

async function loadRecipes() {
  const requestNumber = ++searchNumber;
  setPageLoading(true);
  try {
    await appReady;
    const params = new URLSearchParams();
    const type = filterForm ? filterForm.elements.type.value
      : document.querySelector('[data-type][aria-pressed="true"]').dataset.type;
    if (type) params.set('type', type);
    if (filterForm?.elements.difficulty.value) params.set('difficulty', filterForm.elements.difficulty.value);
    if (!filterForm) params.set('_limit', '3');
    const result = await apiRequest('/recipes?' + params);
    if (requestNumber !== searchNumber) return;
    recipes = result;

    if (filterForm) {
      const query = normalize(filterForm.elements.query.value);
      const ingredients = normalize(filterForm.elements.ingredients.value).split(',').map(item => item.trim()).filter(Boolean);
      const found = recipes.filter(recipe => {
        const products = normalize(recipe.ingredients.map(item => item[0]).join(' '));
        return (!query || normalize(recipe.title).includes(query) || products.includes(query))
          && ingredients.every(item => products.includes(item));
      });
      renderCards(recipeList, found, 'col-sm-6');
      document.getElementById('resultCount').textContent = 'Найдено рецептов: ' + found.length;
      document.getElementById('noResults').hidden = found.length > 0;
    } else {
      renderCards(recipeList, recipes);
    }
    updateActionButtons();
    setPageLoading(false);
  } catch (error) {
    if (requestNumber === searchNumber) showPageError(error);
  }
}

if (filterForm) {
  const params = new URLSearchParams(location.search);
  filterForm.elements.query.value = params.get('query') || '';
  filterForm.elements.type.value = params.get('type') || '';
  filterForm.addEventListener('submit', event => {
    event.preventDefault();
    loadRecipes();
  });
  filterForm.addEventListener('reset', () => setTimeout(loadRecipes, 0));
} else {
  document.querySelectorAll('[data-type]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-type]').forEach(item => item.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      loadRecipes();
    });
  });
}
loadRecipes();
