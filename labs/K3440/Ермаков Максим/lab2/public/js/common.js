// Массивы содержат данные текущей страницы, полученные из API.
const currentUser = readSession()?.user || null;
let cooks = [];
let recipes = [];
let likes = [];
const actions = { saved: [], following: [] };

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, letter => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[letter]));
}

function getInitials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
}

function getAuthor(recipe) {
  return cooks.find(cook => cook.id === recipe.userId)
    || { id: recipe.userId, name: 'Автор рецепта', about: 'Делится домашними рецептами' };
}

function getUserList(name) {
  if (name === 'liked') return likes.filter(item => item.userId === currentUser?.id).map(item => String(item.recipeId));
  const field = name === 'following' ? 'authorId' : 'recipeId';
  return actions[name].map(item => String(item[field]));
}

function getLikeCount(recipe) {
  return recipe.likes + likes.filter(item => String(item.recipeId) === String(recipe.id)).length;
}

function showNotice(text) {
  document.getElementById('noticeText').textContent = text;
  bootstrap.Toast.getOrCreateInstance(document.getElementById('noticeToast')).show();
}

function setPageLoading(loading) {
  const status = document.getElementById('pageStatus');
  status.hidden = !loading;
  status.className = 'small-note mb-4';
  status.setAttribute('role', 'status');
  status.textContent = 'Загружаем данные…';
}

function showPageError(error) {
  const status = document.getElementById('pageStatus');
  status.hidden = false;
  status.className = 'alert alert-danger';
  status.setAttribute('role', 'alert');
  status.textContent = error.message + ' Можно обновить страницу и повторить попытку.';
}

function requireLogin() {
  if (currentUser) return true;
  const next = location.pathname.split('/').pop() + location.search;
  document.getElementById('loginModalLink').href = 'login.html?next=' + encodeURIComponent(next);
  bootstrap.Modal.getOrCreateInstance(document.getElementById('loginModal')).show();
  return false;
}

function recipeCard(recipe) {
  const author = getAuthor(recipe);
  const saved = getUserList('saved').includes(String(recipe.id));
  const href = 'recipe.html?id=' + encodeURIComponent(recipe.id);
  return `
    <article class="card recipe-card h-100">
      <a href="${href}" class="recipe-photo"><img src="assets/images/${escapeHTML(recipe.image)}" alt="${escapeHTML(recipe.title)}" loading="lazy"></a>
      <button class="save-icon" type="button" data-save="${escapeHTML(recipe.id)}" aria-label="${saved ? 'Убрать из сохранённых' : 'Сохранить рецепт'}: ${escapeHTML(recipe.title)}" aria-pressed="${saved}"><i class="bi bi-bookmark${saved ? '-fill' : ''}" aria-hidden="true"></i></button>
      <div class="card-body d-flex flex-column">
        <span class="recipe-type">${escapeHTML(recipe.type)}</span>
        <h3 class="recipe-title"><a href="${href}">${escapeHTML(recipe.title)}</a></h3>
        <div class="recipe-meta"><span><i class="bi bi-clock" aria-hidden="true"></i> ${recipe.time} мин</span><span><i class="bi bi-bar-chart" aria-hidden="true"></i> ${escapeHTML(recipe.difficulty)}</span></div>
        <div class="recipe-bottom mt-auto"><span class="recipe-author"><span class="avatar avatar-small">${escapeHTML(getInitials(author.name))}</span>${escapeHTML(author.name)}</span><span><i class="bi bi-heart" aria-hidden="true"></i> <span data-likes-count="${escapeHTML(recipe.id)}">${getLikeCount(recipe)}</span></span></div>
      </div>
    </article>`;
}

function renderCards(container, list, columnClass = 'col-sm-6 col-lg-4') {
  container.innerHTML = list.map(recipe => `<div class="${columnClass}">${recipeCard(recipe)}</div>`).join('');
}

function updateActionButtons() {
  document.querySelectorAll('[data-save]').forEach(button => {
    const active = getUserList('saved').includes(button.dataset.save);
    button.setAttribute('aria-pressed', active);
    button.querySelector('i').className = 'bi bi-bookmark' + (active ? '-fill' : '');
    const label = button.querySelector('span');
    if (label) label.textContent = active ? 'Рецепт сохранён' : 'Сохранить рецепт';
    const recipe = recipes.find(item => String(item.id) === button.dataset.save);
    button.setAttribute('aria-label', (active ? 'Убрать из сохранённых: ' : 'Сохранить рецепт: ') + recipe.title);
  });
  document.querySelectorAll('[data-follow]').forEach(button => {
    const active = getUserList('following').includes(button.dataset.follow);
    button.setAttribute('aria-pressed', active);
    button.textContent = active ? 'Вы подписаны' : 'Подписаться';
  });
  document.querySelectorAll('[data-like]').forEach(button => {
    const recipe = recipes.find(item => String(item.id) === button.dataset.like);
    const active = getUserList('liked').includes(button.dataset.like);
    button.setAttribute('aria-pressed', active);
    button.querySelector('i').className = 'bi bi-heart' + (active ? '-fill' : '');
    button.querySelector('span').textContent = getLikeCount(recipe);
  });
  document.querySelectorAll('[data-likes-count]').forEach(element => {
    const recipe = recipes.find(item => String(item.id) === element.dataset.likesCount);
    element.textContent = getLikeCount(recipe);
  });
}

async function toggleAction(collection, field, id) {
  const list = collection === 'likes' ? likes : actions[collection];
  const existing = list.find(item => item.userId === currentUser.id && String(item[field]) === String(id));
  if (existing) {
    await apiRequest('/' + collection + '/' + existing.id, { method: 'DELETE' });
    list.splice(list.indexOf(existing), 1);
  } else {
    const record = await apiRequest('/' + collection, {
      method: 'POST', body: { userId: currentUser.id, [field]: field === 'authorId' ? Number(id) : id }
    });
    list.push(record);
  }
}

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-save], [data-follow], [data-like]');
  if (!button || button.disabled || !requireLogin()) return;
  button.disabled = true;
  try {
    if (button.hasAttribute('data-save')) await toggleAction('saved', 'recipeId', button.dataset.save);
    if (button.hasAttribute('data-follow')) await toggleAction('following', 'authorId', button.dataset.follow);
    if (button.hasAttribute('data-like')) await toggleAction('likes', 'recipeId', button.dataset.like);
    document.dispatchEvent(new Event('actionsChanged'));
    updateActionButtons();
  } catch (error) {
    showNotice(error.message);
  } finally {
    button.disabled = false;
  }
});

const account = document.getElementById('accountLinks');
if (currentUser) {
  account.innerHTML = `<a class="account-profile" href="profile.html"><span class="avatar">${escapeHTML(getInitials(currentUser.name))}</span><span>Моя кухня</span></a><button class="btn btn-link logout-button" id="logoutButton" type="button">Выйти</button>`;
  document.getElementById('logoutButton').addEventListener('click', () => {
    clearSession();
    location.href = 'index.html';
  });
}
const activeLink = document.querySelector(`[data-nav="${document.body.dataset.page}"]`);
if (activeLink) activeLink.setAttribute('aria-current', 'page');

async function initializeApp() {
  const page = document.body.dataset.page;
  if (['login', 'register'].includes(page) || (page === 'profile' && !currentUser)) return;
  [cooks, likes] = await Promise.all([apiRequest('/authors'), apiRequest('/likes')]);
  if (currentUser) {
    [actions.saved, actions.following] = await Promise.all([
      apiRequest('/saved'), apiRequest('/following')
    ]);
  }
}

// Скрипты страниц ждут эту загрузку перед выводом карточек и кнопок.
const appReady = initializeApp();
