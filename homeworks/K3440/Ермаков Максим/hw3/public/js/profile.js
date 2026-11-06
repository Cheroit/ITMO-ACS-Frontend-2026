function renderProfile() {
  const savedIds = getUserList('saved');
  const saved = recipes.filter(recipe => savedIds.includes(String(recipe.id)));
  const publications = recipes.filter(recipe => recipe.userId === currentUser.id);
  const following = cooks.filter(cook => getUserList('following').includes(String(cook.id)));
  renderCards(document.getElementById('savedRecipes'), saved);
  renderCards(document.getElementById('myRecipes'), publications);
  document.getElementById('savedEmpty').hidden = saved.length > 0;
  document.getElementById('publicationsEmpty').hidden = publications.length > 0;
  document.getElementById('followingEmpty').hidden = following.length > 0;
  document.getElementById('savedCount').textContent = saved.length;
  document.getElementById('publicationCount').textContent = publications.length;
  document.getElementById('followingCount').textContent = following.length;
  document.getElementById('followingList').innerHTML = following.map(cook => `
    <div class="col-md-6"><article class="cook-card"><span class="avatar avatar-large" aria-hidden="true">${escapeHTML(getInitials(cook.name))}</span><div><h3>${escapeHTML(cook.name)}</h3><p>${escapeHTML(cook.about)}</p></div><button class="btn btn-outline-primary" type="button" data-follow="${cook.id}">Вы подписаны</button></article></div>`).join('');
}

async function loadProfile() {
  if (!currentUser) {
    location.replace('login.html?next=profile.html');
    return;
  }
  setPageLoading(true);
  try {
    await appReady;
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileAvatar').textContent = getInitials(currentUser.name);
    document.getElementById('profileEmail').textContent = currentUser.email;
    const params = new URLSearchParams();
    getUserList('saved').forEach(id => params.append('id', id));
    const [publications, saved] = await Promise.all([
      apiRequest('/recipes?' + new URLSearchParams({ userId: currentUser.id })),
      actions.saved.length ? apiRequest('/recipes?' + params) : Promise.resolve([])
    ]);
    // Рецепт может быть и своим, и сохранённым. Map убирает повторения по id.
    recipes = [...new Map([...publications, ...saved].map(recipe => [recipe.id, recipe])).values()];
    renderProfile();
    updateActionButtons();
    setPageLoading(false);
  } catch (error) {
    showPageError(error);
  }
}

document.addEventListener('actionsChanged', renderProfile);
document.getElementById('publishForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  if (!requireLogin()) return;
  const form = this.elements;
  const ingredients = form.ingredients.value.split('\n').filter(line => line.trim()).map(line => {
    const parts = line.split('—');
    return [parts[0].trim(), (parts[1] || '').trim()];
  });
  const steps = form.steps.value.split('\n').filter(line => line.trim())
    .map((line, index) => ['Шаг ' + (index + 1), line.trim()]);
  const error = document.getElementById('publishError');
  error.hidden = true;
  if (!form.title.value.trim() || !ingredients.length || !steps.length) {
    error.textContent = 'Заполните название, ингредиенты и шаги приготовления.';
    error.hidden = false;
    return;
  }
  const body = {
    userId: currentUser.id, title: form.title.value.trim(), type: form.type.value,
    difficulty: form.difficulty.value, time: Number(form.time.value), portions: Number(form.portions.value),
    image: form.image.value, description: form.description.value.trim(), ingredients, steps
  };
  const button = this.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const recipe = await apiRequest('/recipes', { method: 'POST', body });
    recipes.unshift(recipe);
    this.reset();
    bootstrap.Modal.getInstance(document.getElementById('publishModal')).hide();
    renderProfile();
    updateActionButtons();
    bootstrap.Tab.getOrCreateInstance(document.getElementById('publicationsTab')).show();
    showNotice('Рецепт опубликован');
  } catch (requestError) {
    error.textContent = requestError.message;
    error.hidden = false;
    error.scrollIntoView({ block: 'nearest' });
  } finally {
    button.disabled = false;
  }
});
loadProfile();
