const recipeId = new URLSearchParams(location.search).get('id') || 'pasta';
let comments = [];

function renderComments() {
  document.getElementById('commentCount').textContent = comments.length;
  document.getElementById('commentList').innerHTML = comments.length ? comments.map(item => {
    const author = cooks.find(cook => cook.id === item.userId);
    const name = author ? author.name : 'Кулинар';
    const date = new Date(item.createdAt).toLocaleDateString('ru-RU');
    return `<article class="comment"><span class="avatar">${escapeHTML(getInitials(name))}</span><div><h3>${escapeHTML(name)} <time datetime="${escapeHTML(item.createdAt)}">${date}</time></h3><p>${escapeHTML(item.text)}</p></div></article>`;
  }).join('') : '<p class="empty-note">Здесь пока тихо. Оставьте первый комментарий!</p>';
}

async function loadRecipe() {
  setPageLoading(true);
  try {
    await appReady;
    const recipe = await apiRequest('/recipes/' + encodeURIComponent(recipeId));
    comments = await apiRequest('/comments?' + new URLSearchParams({ recipeId, _sort: 'createdAt', _order: 'desc' }));
    recipes = [recipe];
    const author = getAuthor(recipe);
    document.title = recipe.title + ' — На кухне';
    document.getElementById('recipeTitle').textContent = recipe.title;
    document.getElementById('recipeType').textContent = recipe.type;
    document.getElementById('recipeDescription').textContent = recipe.description;
    document.getElementById('recipeTime').textContent = recipe.time + ' мин';
    document.getElementById('recipeDifficulty').textContent = recipe.difficulty;
    document.querySelectorAll('[data-portions]').forEach(element => element.textContent = 'Порций: ' + recipe.portions);
    const image = document.getElementById('recipeImage');
    image.src = 'assets/images/' + recipe.image;
    image.alt = recipe.title;
    document.getElementById('authorName').textContent = author.name;
    document.getElementById('authorAbout').textContent = author.about;
    document.getElementById('authorAvatar').textContent = getInitials(author.name);
    document.getElementById('followButton').dataset.follow = author.id;
    document.getElementById('followButton').hidden = currentUser?.id === author.id;
    document.getElementById('saveButton').dataset.save = recipe.id;
    document.getElementById('likeButton').dataset.like = recipe.id;
    document.getElementById('ingredientList').innerHTML = recipe.ingredients.map((item, index) => `
      <label class="ingredient" for="ingredient${index}"><input class="form-check-input" id="ingredient${index}" type="checkbox"><span>${escapeHTML(item[0])}</span><span class="ingredient-amount">${escapeHTML(item[1])}</span></label>`).join('');
    document.getElementById('stepList').innerHTML = recipe.steps.map(item => `<li><h3>${escapeHTML(item[0])}</h3><p>${escapeHTML(item[1])}</p></li>`).join('');
    renderComments();
    updateActionButtons();
    document.getElementById('recipeContent').hidden = false;
    setPageLoading(false);
  } catch (error) {
    if (error.status === 404) {
      setPageLoading(false);
      document.getElementById('recipeNotFound').hidden = false;
    } else showPageError(error);
  }
}

document.getElementById('commentForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  if (!requireLogin()) return;
  const text = this.elements.comment.value.trim();
  if (!text) return;
  const button = this.querySelector('[type="submit"]');
  const error = document.getElementById('commentError');
  error.hidden = true;
  button.disabled = true;
  try {
    const comment = await apiRequest('/comments', { method: 'POST', body: { userId: currentUser.id, recipeId, text } });
    comments.unshift(comment);
    this.reset();
    renderComments();
    showNotice('Комментарий добавлен');
  } catch (requestError) {
    error.textContent = requestError.message;
    error.hidden = false;
  } finally {
    button.disabled = false;
  }
});
loadRecipe();
