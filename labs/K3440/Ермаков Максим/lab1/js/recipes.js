const recipeList = document.getElementById('recipeList');
const filterForm = document.getElementById('filterForm');

function filterRecipes() {
  const query = filterForm.elements.query.value.trim().toLowerCase().replaceAll('ё', 'е');
  const type = filterForm.elements.type.value;
  const difficulty = filterForm.elements.difficulty.value;
  const ingredients = filterForm.elements.ingredients.value.toLowerCase().replaceAll('ё', 'е').split(',').map(item => item.trim()).filter(Boolean);

  const found = getRecipes().filter(function (recipe) {
    const products = recipe.ingredients.map(item => item[0]).join(' ').toLowerCase().replaceAll('ё', 'е');
    const title = recipe.title.toLowerCase().replaceAll('ё', 'е');
    return (!query || title.includes(query) || products.includes(query))
      && (!type || recipe.type === type)
      && (!difficulty || recipe.difficulty === difficulty)
      && ingredients.every(item => products.includes(item));
  });

  renderCards(recipeList, found, 'col-sm-6');
  document.getElementById('resultCount').textContent = 'Найдено рецептов: ' + found.length;
  document.getElementById('noResults').hidden = found.length > 0;
}

if (filterForm) {
  const params = new URLSearchParams(location.search);
  filterForm.elements.query.value = params.get('query') || '';
  filterForm.elements.type.value = params.get('type') || '';
  filterForm.addEventListener('submit', function (event) {
    event.preventDefault();
    filterRecipes();
  });
  filterForm.addEventListener('reset', function () {
    // reset обновляет поля после завершения обработчика.
    setTimeout(filterRecipes, 0);
  });
  filterRecipes();
} else {
  // Главная показывает три рецепта из выбранной категории.
  function showFeatured(type = '') {
    const list = type ? getRecipes().filter(recipe => recipe.type === type) : [initialRecipes[0], initialRecipes[1], initialRecipes[3]];
    renderCards(recipeList, list.slice(0, 3));
  }
  document.querySelectorAll('[data-type]').forEach(button => {
    button.addEventListener('click', function () {
      document.querySelectorAll('[data-type]').forEach(item => item.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      showFeatured(button.dataset.type);
    });
  });
  showFeatured();
}
