const recipeId = new URLSearchParams(location.search).get('id') || 'pasta';
const recipe = getRecipes().find(item => item.id === recipeId);

if (!recipe) {
  document.getElementById('recipeContent').hidden = true;
  document.getElementById('recipeNotFound').hidden = false;
} else {
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
  document.getElementById('authorAvatar').textContent = author.initials;
  document.getElementById('followButton').dataset.follow = author.id;
  document.getElementById('followButton').hidden = currentUser && author.id === currentUser.email;
  document.getElementById('saveButton').dataset.save = recipe.id;
  document.getElementById('likeButton').dataset.like = recipe.id;

  document.getElementById('ingredientList').innerHTML = recipe.ingredients.map((item, index) => `
    <label class="ingredient" for="ingredient${index}"><input class="form-check-input" id="ingredient${index}" type="checkbox"><span>${escapeHTML(item[0])}</span><span class="ingredient-amount">${escapeHTML(item[1])}</span></label>`).join('');
  document.getElementById('stepList').innerHTML = recipe.steps.map(item => `<li><h3>${escapeHTML(item[0])}</h3><p>${escapeHTML(item[1])}</p></li>`).join('');

  const video = document.getElementById('recipeVideo');
  video.src = 'https://www.youtube-nocookie.com/embed/' + recipe.videoId;
  video.title = 'Видео о приготовлении: ' + recipe.title;
  document.getElementById('videoLink').href = 'https://www.youtube.com/watch?v=' + recipe.videoId;
  document.getElementById('videoAuthor').textContent = 'Ещё один способ приготовить это блюдо — от ' + recipe.videoAuthor + '.';

  const commentKey = 'nk-comments:' + recipe.id;
  const sampleComments = recipe.id === 'pasta' ? [
    { name: 'Мария Котова', text: 'Приготовила на ужин — очень вкусно! Добавила немного пармезана.', date: '12.10.2026' },
    { name: 'Дмитрий Петров', text: 'Спасибо за понятный рецепт. Обязательно повторю.', date: '11.10.2026' }
  ] : [];
  const comments = readStorage(commentKey, sampleComments);

  function renderComments() {
    document.getElementById('commentCount').textContent = comments.length;
    document.getElementById('commentList').innerHTML = comments.length ? comments.map(item => `
      <article class="comment"><span class="avatar">${escapeHTML(getInitials(item.name))}</span><div><h3>${escapeHTML(item.name)} <time>${escapeHTML(item.date)}</time></h3><p>${escapeHTML(item.text)}</p></div></article>`).join('') : '<p class="empty-note">Здесь пока тихо. Оставьте первый комментарий!</p>';
  }

  document.getElementById('commentForm').addEventListener('submit', function (event) {
    event.preventDefault();
    if (!requireLogin()) return;
    const text = this.elements.comment.value.trim();
    if (!text) return;
    comments.unshift({ name: currentUser.name, text, date: new Date().toLocaleDateString('ru-RU') });
    localStorage.setItem(commentKey, JSON.stringify(comments));
    this.reset();
    renderComments();
    showNotice('Комментарий добавлен');
  });
  renderComments();
  updateActionButtons();
}
