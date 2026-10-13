// Общие функции: данные в браузере, карточки и кнопки социальных действий.
function readStorage(key, fallback, storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

const currentUser = readStorage('nk-user', null) || readStorage('nk-user', null, sessionStorage);

function userKey(name) {
  return 'nk-' + name + ':' + (currentUser ? currentUser.email : 'guest');
}

function getUserList(name) {
  return readStorage(userKey(name), []);
}

function toggleUserItem(name, id) {
  const list = getUserList(name);
  const index = list.indexOf(id);
  if (index === -1) list.push(id);
  else list.splice(index, 1);
  localStorage.setItem(userKey(name), JSON.stringify(list));
}

function getRecipes() {
  return initialRecipes.concat(readStorage('nk-publications', []));
}

// Пользовательский текст вставляется в HTML только после экранирования.
function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, function (letter) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[letter];
  });
}

function getAuthor(recipe) {
  return cooks.find(cook => cook.id === recipe.authorId) || {
    id: recipe.authorId, name: recipe.authorName, about: 'Делится домашними рецептами',
    initials: getInitials(recipe.authorName)
  };
}

function getInitials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
}

function showNotice(text) {
  document.getElementById('noticeText').textContent = text;
  bootstrap.Toast.getOrCreateInstance(document.getElementById('noticeToast')).show();
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
  const saved = getUserList('saved').includes(recipe.id);
  const likes = recipe.likes + Number(getUserList('liked').includes(recipe.id));
  const href = 'recipe.html?id=' + encodeURIComponent(recipe.id);
  return `
    <article class="card recipe-card h-100">
      <a href="${href}" class="recipe-photo"><img src="assets/images/${escapeHTML(recipe.image)}" alt="${escapeHTML(recipe.title)}" loading="lazy"></a>
      <button class="save-icon" type="button" data-save="${escapeHTML(recipe.id)}" aria-label="${saved ? 'Убрать из сохранённых' : 'Сохранить рецепт'}: ${escapeHTML(recipe.title)}" aria-pressed="${saved}"><i class="bi bi-bookmark${saved ? '-fill' : ''}" aria-hidden="true"></i></button>
      <div class="card-body d-flex flex-column">
        <span class="recipe-type">${escapeHTML(recipe.type)}</span>
        <h3 class="recipe-title"><a href="${href}">${escapeHTML(recipe.title)}</a></h3>
        <div class="recipe-meta"><span><i class="bi bi-clock" aria-hidden="true"></i> ${recipe.time} мин</span><span><i class="bi bi-bar-chart" aria-hidden="true"></i> ${escapeHTML(recipe.difficulty)}</span></div>
        <div class="recipe-bottom mt-auto"><span class="recipe-author"><span class="avatar avatar-small">${escapeHTML(author.initials)}</span>${escapeHTML(author.name)}</span><span><i class="bi bi-heart" aria-hidden="true"></i> ${likes}</span></div>
      </div>
    </article>`;
}

function renderCards(container, recipes, columnClass = 'col-sm-6 col-lg-4') {
  container.innerHTML = recipes.map(recipe => `<div class="${columnClass}">${recipeCard(recipe)}</div>`).join('');
}

function updateActionButtons() {
  const saved = getUserList('saved');
  document.querySelectorAll('[data-save]').forEach(button => {
    const active = saved.includes(button.dataset.save);
    button.setAttribute('aria-pressed', active);
    button.querySelector('i').className = 'bi bi-bookmark' + (active ? '-fill' : '');
    const label = button.querySelector('span');
    if (label) label.textContent = active ? 'Рецепт сохранён' : 'Сохранить рецепт';
    const recipe = getRecipes().find(item => item.id === button.dataset.save);
    button.setAttribute('aria-label', (active ? 'Убрать из сохранённых: ' : 'Сохранить рецепт: ') + recipe.title);
  });
  document.querySelectorAll('[data-follow]').forEach(button => {
    const active = getUserList('following').includes(button.dataset.follow);
    button.setAttribute('aria-pressed', active);
    button.textContent = active ? 'Вы подписаны' : 'Подписаться';
  });
  document.querySelectorAll('[data-like]').forEach(button => {
    const recipe = getRecipes().find(item => item.id === button.dataset.like);
    const active = getUserList('liked').includes(recipe.id);
    button.setAttribute('aria-pressed', active);
    button.querySelector('i').className = 'bi bi-heart' + (active ? '-fill' : '');
    button.querySelector('span').textContent = recipe.likes + Number(active);
  });
}

// Один обработчик работает и с карточками, добавленными после фильтрации.
document.addEventListener('click', function (event) {
  const button = event.target.closest('[data-save], [data-follow], [data-like]');
  if (!button || !requireLogin()) return;
  if (button.hasAttribute('data-save')) {
    toggleUserItem('saved', button.dataset.save);
    document.dispatchEvent(new Event('savedChanged'));
  }
  if (button.hasAttribute('data-follow')) {
    toggleUserItem('following', button.dataset.follow);
    document.dispatchEvent(new Event('followingChanged'));
  }
  if (button.hasAttribute('data-like')) toggleUserItem('liked', button.dataset.like);
  updateActionButtons();
});

const account = document.getElementById('accountLinks');
if (currentUser) {
  account.innerHTML = `<a class="account-profile" href="profile.html"><span class="avatar">${escapeHTML(getInitials(currentUser.name))}</span><span>Моя кухня</span></a><button class="btn btn-link logout-button" id="logoutButton" type="button">Выйти</button>`;
  document.getElementById('logoutButton').addEventListener('click', function () {
    localStorage.removeItem('nk-user');
    sessionStorage.removeItem('nk-user');
    location.href = 'index.html';
  });
}

const activeLink = document.querySelector(`[data-nav="${document.body.dataset.page}"]`);
if (activeLink) activeLink.setAttribute('aria-current', 'page');
